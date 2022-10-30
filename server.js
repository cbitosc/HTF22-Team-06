const nodemailer = require('nodemailer');
const schedule = require('node-schedule');

const date = new Date(2022, 9, 30, 13, 36, 0);


let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'shahbazjahan5@gmail.com',
		pass: 'cyjtqpnysfhrikbi'
	}
});

let mailDetails = {
	from: 'shahbazjahan5@gmail.com',
	to: 'alwalsowmika26@gmail.com',
	subject: 'Test mail',
	text: 'Node.js testing mail for crap'
};
const job = schedule.scheduleJob(date, function(){
// cron.schedule('* * * * * *', () => {
    mailTransporter.sendMail(mailDetails, function(err, data) {
	    if(err) {
		    console.log('Error Occurs');
            console.log(err);
	    } else {
		    console.log('Email sent successfully');
	    }
    });
    // console.log("hello worls");
});
