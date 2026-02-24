import prisma from '../config/database.js';
import { AppError } from './errorHandler.js';

/**
 * Middleware de seguridad multi-tenant.
 * 
 * Verifica que los recursos referenciados (clientId, petId, appointmentId, etc.)
 * realmente pertenezcan a la clínica del usuario autenticado.
 * 
 * Previene ataques IDOR (Insecure Direct Object Reference) donde un usuario
 * de una clínica intenta acceder/modificar recursos de otra clínica.
 * 
 * Uso en rutas:
 *   router.post('/', tenantGuard('petId', 'pet'), controller.create);
 *   router.post('/', tenantGuard('clientId', 'client'), controller.create);
 *   router.post('/', tenantGuard(['petId', 'pet'], ['clientId', 'client']), controller.create);
 */

// Verificar que un recurso pertenece a la clínica
async function verifyOwnership(model, id, clinicId) {
  if (!id) return true; // Si no se envía el campo, no hay nada que verificar

  const record = await prisma[model].findFirst({
    where: { id, clinicId },
    select: { id: true },
  });

  return !!record;
}

/**
 * @param  {...[string, string]} pairs - Pares de [fieldName, modelName]
 *   Ejemplo: tenantGuard(['petId', 'pet'], ['clientId', 'client'])
 *   O simplemente: tenantGuard('petId', 'pet') para un solo campo
 */
export const tenantGuard = (...args) => {
  // Normalizar argumentos: puede ser tenantGuard('petId', 'pet') o tenantGuard(['petId', 'pet'], ['clientId', 'client'])
  let pairs;
  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
    pairs = [[args[0], args[1]]];
  } else {
    pairs = args;
  }

  return async (req, res, next) => {
    try {
      const clinicId = req.clinicId || req.user?.clinicId;

      if (!clinicId) {
        return next(new AppError('No se pudo determinar la clínica del usuario.', 403));
      }

      for (const [fieldName, modelName] of pairs) {
        // Buscar el ID en body, params o query
        const resourceId = req.body?.[fieldName] || req.params?.[fieldName] || req.query?.[fieldName];

        if (resourceId) {
          const isOwned = await verifyOwnership(modelName, resourceId, clinicId);
          if (!isOwned) {
            return next(new AppError(
              `Acceso denegado: el recurso ${modelName} (${resourceId}) no pertenece a tu clínica.`,
              403
            ));
          }
        }
      }

      next();
    } catch (error) {
      next(new AppError('Error al verificar permisos de tenant.', 500));
    }
  };
};

/**
 * Middleware que valida que el :id del params pertenezca a la clínica.
 * Para rutas GET/PUT/DELETE /:id
 * 
 * Uso: router.get('/:id', tenantParamGuard('client'), controller.getById);
 */
export const tenantParamGuard = (modelName) => {
  return async (req, res, next) => {
    try {
      const clinicId = req.clinicId || req.user?.clinicId;
      const resourceId = req.params.id;

      if (!clinicId) {
        return next(new AppError('No se pudo determinar la clínica del usuario.', 403));
      }

      if (resourceId) {
        const isOwned = await verifyOwnership(modelName, resourceId, clinicId);
        if (!isOwned) {
          return next(new AppError('Recurso no encontrado o no pertenece a tu clínica.', 404));
        }
      }

      next();
    } catch (error) {
      next(new AppError('Error al verificar permisos de tenant.', 500));
    }
  };
};

/**
 * Middleware que sanitiza y fuerza el clinicId en el body.
 * Previene que un usuario envíe un clinicId diferente al suyo.
 * Se aplica DESPUÉS de ensureClinic como capa extra.
 */
export const forceClinicId = (req, res, next) => {
  const clinicId = req.user?.clinicId;

  if (!clinicId) {
    return next(new AppError('Usuario sin clínica asignada.', 403));
  }

  // Forzar clinicId en body (prevenir inyección)
  if (req.body && typeof req.body === 'object') {
    req.body.clinicId = clinicId;
  }

  // Forzar en query (prevenir filtrado por otra clínica)
  if (req.query && req.query.clinicId) {
    req.query.clinicId = clinicId;
  }

  next();
};

export default { tenantGuard, tenantParamGuard, forceClinicId };
