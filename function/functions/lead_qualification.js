exports.handler = async(context, event, callback) =>{
    
    const {CurrentTask} = event;

    //calling task handlers
    switch(CurrentTask){

        case 'greeting' :
            await greetingTaskHandler(context, event, callback);
            break;

        case 'start_lead_qualification' :
            await startLeadQualificationTaskHandler(context, event, callback);
            break;

        case 'complete_lead_qualification' :
            await completeLeadQualificationTaskHandler(context, event, callback);
            break;

        case 'goodbye' :
            await goodbyeTaskHandler(context, event, callback);
            break;

        case 'collect_fallback' :
            await collectFallbackTaskHandler(context, event, callback);
            break;

        case 'fallback' :
            await fallbackHandler(context, event, callback);
            break;

        default :
            await fallbackHandler(context, event, callback);
    } 
};

//greeting handler function
const greetingTaskHandler = async (context, event, callback) => {

    const Say = 'Hi there! Thanks for your interest in our service. Do you mind answering a few questions to help me connect you to the best person on our sales team?',
          Listen = false,
          Collect = false,
          TaskFilter = ["goodbye", "start_lead_qualification"];

    speechOut(Say, Listen, TaskFilter, Collect, callback);
}

//start_lead_qualification handler function
const startLeadQualificationTaskHandler = async (context, event, callback) => {

    const Say = false,
          Listen = false,
          Collect = {
            "on_complete" : {
                "redirect" : {
                    "method" : "POST",
                    "uri" : "task://complete_lead_qualification"
                }
            },
            "name" : "lead_qual",
            "questions" : [
                {
                    "type" : "Twilio.NUMBER",
                    "question" : "Great! How many employees do you have?",
                    "name" : "lead_qual_employees"
                },
                {
                    "type" : "Twilio.COUNTRY",
                    "question" : "Thanks. Which country are you located in?",
                    "name" : "lead_qual_country"
                },
                {
                    "type" : "Twilio.YES_NO",
                    "question" : "Do you have an existing vendor for this?",
                    "name" : "lead_qual_yes_no"
                },
                {
                    "type" : "Twilio.PHONE_NUMBER",
                    "question" : "Thanks! Last question. What number should we call to continue the conversation?",
                    "name" : "lead_qual_number"
                }
            ]
        },
        TaskFilter = false;

    speechOut(Say, Listen, TaskFilter, Collect, callback);
}

//complete_lead_qualification handler function
const completeLeadQualificationTaskHandler = async (context, event, callback) => {

    const Say = 'Thank you. Someone from our sales team will reach out shortly! Have a great day. Goodbye.',
          Listen = false,
          Collect = false,
          TaskFilter = false;

    const {lead_qual_employees, lead_qual_country, lead_qual_yes_no, lead_qual_number} = JSON.parse(event.Memory).twilio.collected_data.lead_qual.answers;

    console.log(`No. of employees : ${lead_qual_employees.answer}, country : ${lead_qual_country.answer}, Number : ${lead_qual_number.answer}, Vendor : ${lead_qual_yes_no.answer}`)

    speechOut(Say, Listen, TaskFilter, Collect, callback);
}

//goodbye handler function
const goodbyeTaskHandler = async (context, event, callback) => {

    const Say = "No worries. Please reach out if you want to chat again in the future. Goodbye!",
          Listen = false,
          Collect = false,
          TaskFilter = false;

    speechOut(Say, Listen, TaskFilter, Collect, callback);
}

//collect_fallback handler function
const collectFallbackTaskHandler = async (context, event, callback) => {

    const Say = "Looks like you having trouble. Apologies for that. Let's start again, how can I help you today?",
          Listen = true,
          Collect = false,
          TaskFilter = false;

    speechOut(Say, Listen, TaskFilter, Collect, callback);
}

//fallback handler function
const fallbackHandler = async (context, event, callback) => {

    const Say = "I'm sorry didn't quite get that. Please say that again.",
          Listen = true,
          Collect = false,
          TaskFilter = false;

    speechOut(Say, Listen, TaskFilter, Collect, callback);
}

/** 
 * speech-out function 
 * @Say {string}             // message to speak out
 * @Listen {boolean}         // keep session true or false
 * @TaskFilter {array}       // save data in remember object 
 * @callback {function}      // return twilio function response 
 * */ 
const speechOut = (Say, Listen, TaskFilter, Collect, callback) => {

    let responseObject = {
		"actions": []
    };

    if(Say)
        responseObject.actions.push(
            {
				"say": {
					"speech": Say
				}
			}
        );

    if(TaskFilter){
        responseObject.actions.push(
            {
                "listen" : {
                    "tasks" : TaskFilter
                }
            }
        )
    }

    if(Listen)
        responseObject.actions.push(
            { 
                "listen": true 
            }
        );

    if(Collect)
        responseObject.actions.push(
            {
                "collect" : Collect
            }
        );

    // return twilio function response
    callback(null, responseObject);
}