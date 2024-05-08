import nodemailer from "nodemailer";
import config from "../../config";

const emailSender = async (email: string, link: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: config.mail_sender_email,
      pass: config.mail_sender_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Lifiline Healthcare" <naimk0047@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Password Reset Link", // Subject line
    // text: "Hello world?", // plain text body
    html: `<div>
	        <h4>Dear User,</h4>
            <p>Your Password Reset Link is here.</p>
            <a href=${link}> <button>Reset Password</button> </a>
        </div>`, // html body
  });

//   console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
};

export default emailSender;
