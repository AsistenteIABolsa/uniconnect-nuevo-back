// services/emailService.js (en el backend)
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); 
// Configuración del transportador de Zoho
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Función para verificar la conexión
const verificarConexion = async () => {
  try {
    await transporter.verify();
    console.log('✅ Servidor de Zoho Mail listo para enviar emails');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de Zoho Mail:', error.message);
    
    // Debug más detallado
    if (error.code === 'EAUTH') {
      console.log('🔐 Problema de autenticación:');
      console.log('   - Verifica que el email sea: edwin.bravo01@zohomail.com');
      console.log('   - Verifica la contraseña en Zoho');
      console.log('   - Asegúrate de habilitar "Acceso de aplicaciones de terceros"');
    }
    
    return false; 
   }

};

// Función para enviar código de verificación
const sendVerificationCode = async (email, code) => {
  try {
    const mailOptions = {
      from: `"Uniconnect" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "Código de verificación - Uniconnect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0;">Uniconnect</h2>
            <p style="color: #6b7280; margin: 5px 0;">Plataforma de empleo universitario</p>
          </div>
          
          <h3 style="color: #1f2937;">Verificación de cuenta</h3>
          <p>Hola,</p>
          <p>Tu código de verificación para activar tu cuenta en Uniconnect es:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${code}</h1>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Este código expirará en 10 minutos.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Si no solicitaste crear una cuenta en Uniconnect, puedes ignorar este mensaje.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Saludos,<br>
              El equipo de Uniconnect
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de verificación enviado a:', email);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    return false;
  }
};

// Función para enviar código de recuperación de contraseña
const sendPasswordResetCode = async (email, code) => {
  try {
    const mailOptions = {
      from: `"Uniconnect" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "Recuperación de contraseña - Uniconnect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0;">Uniconnect</h2>
            <p style="color: #6b7280; margin: 5px 0;">Plataforma de empleo universitario</p>
          </div>
          
          <h3 style="color: #1f2937;">Recuperación de contraseña</h3>
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Tu código de verificación es:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${code}</h1>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Este código expirará en 10 minutos.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Saludos,<br>
              El equipo de Uniconnect
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado a:', email);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error);
    return false;
  }
};

export {
  sendVerificationCode,
  sendPasswordResetCode,
  verificarConexion
};