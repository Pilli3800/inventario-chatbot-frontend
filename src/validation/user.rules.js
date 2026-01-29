// src/validation/user.rules.js

export const userRules = {
  email: [
    { required: true, message: 'El email es obligatorio' },
    { type: 'email', message: 'Debe ser un email válido' }
  ],
  dni: [
    { required: true, message: 'El DNI es obligatorio' },
    { pattern: /^\d{8}$/, message: 'Debe tener 8 dígitos numéricos' }
  ],
  nombres: [
    { required: true, message: 'Los nombres son obligatorios' },
    { pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/, message: 'Solo letras' }
  ],
  apellidos: [
    { required: true, message: 'Los apellidos son obligatorios' },
    { pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/, message: 'Solo letras' }
  ],
  roles: [
    { required: true, message: 'Debe seleccionar al menos un rol' }
  ]
}
