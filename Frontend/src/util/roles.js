export const ROLES = {
  ADMIN:     'admin',
  OPERADOR:  'operador',
  CONDUCTOR: 'conductor',
  USUARIO:   'usuario',
}

export const esAdmin     = u => u?.rol === ROLES.ADMIN
export const esOperador  = u => u?.rol === ROLES.OPERADOR || u?.rol === ROLES.ADMIN
export const esConductor = u => u?.rol === ROLES.CONDUCTOR
export const esUsuario   = u => u?.rol === ROLES.USUARIO