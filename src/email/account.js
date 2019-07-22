const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to : email,
        from : 'ishantgupta777@gmail.com',
        subject : 'welcome to task management',
        text : 'we are glad you join us'
    })
}

const sendCancelEmail = (email,name)=>{
    sgMail.send({
        to : email,
        from : 'ishantgupta777@gmail.com',
        subject : 'why are you cancelling',
        text : 'we are not  glad you are leaving us' + name 
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}

