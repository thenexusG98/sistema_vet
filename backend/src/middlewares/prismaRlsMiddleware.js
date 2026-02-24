/**
 * Prisma Middleware para Row Level Security (RLS)
 * 
 * Este middleware inyecta SET app.current_clinic_id antes
 * de cada operación de Prisma, activando las políticas RLS
 * de PostgreSQL como capa adicional de seguridad.
 * 
 * NOTA: Requiere que las políticas RLS estén creadas en la BD.
 * Ver: prisma/migrations/rls_policies.sql
 */
import prisma from '../config/database.js';
import { AsyncLocalStorage } from 'node:async_hooks';

// AsyncLocalStorage para pasar el clinicId a través del stack de llamadas
export const clinicContext = new AsyncLocalStorage();

/**
 * Express middleware: almacena el clinicId en AsyncLocalStorage
 * Debe ir DESPUÉS de authenticate y ensureClinic
 */
export const setClinicContext = (req, res, next) => {
  const clinicId = req.clinicId || req.user?.clinicId;
  if (!clinicId) {
    return next();
  }

  clinicContext.run({ clinicId }, () => {
    next();
  });
};

/**
 * Registra el middleware de Prisma para RLS
 * Llama a esta función al iniciar la aplicación
 */
export const registerRlsMiddleware = () => {
  prisma.$use(async (params, next) => {
    const store = clinicContext.getStore();
    
    if (store?.clinicId) {
      // Establecer variable de sesión antes de la query
      try {
        await prisma.$executeRawUnsafe(
          `SET LOCAL app.current_clinic_id = '${store.clinicId}'`
        );
      } catch (e) {
        // Si RLS no está configurado, continuar sin error
        // Esto permite que la app funcione sin RLS habilitado
      }
    }

    return next(params);
  });
};

export default { setClinicContext, registerRlsMiddleware, clinicContext };
