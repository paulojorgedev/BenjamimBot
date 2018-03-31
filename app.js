const builder = require('botbuilder');
const cognitiveServices = require('botbuilder-cognitiveservices');
const restify = require('restify');
const request = require('request');

const port = process.env.port || 3978;
const server = restify.createServer();

server.listen(port,() =>{
   console.log("Rodando"); 
});

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSRWORD
    
});

const bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());
server.post('/api/messages', connector.listen());

const recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/856f5477-f391-4107-ae0d-74035a1153db?subscription-key=93ff912e13d74598b4516d3d8d7124a4&verbose=true&timezoneOffset=0&q=');

const intents= new builder.IntentDialog({
    recognizers: [recognizer]
});

bot.dialog('/', intents);

intents.onDefault((session, args) => {
    session.send("Desculpe, não fui programado para responder essa pergunta")
});
                  
intents.matches("Cumprimento", (session,args)=>{
    session.send("Olá, você gostaria de ver a tarefa doméstica de quem?");
});

intents.matches("Sobre", (session,args)=>{
    session.send("Olá, eu sou o Benjamim\n\nEstou aqui para te dizer as tarefas domésticas a serem realizadas\n\nÉ só me chamar e pedir a tarefa de qualquer pessoa da casa :)\n\n");
});

intents.matches("Tarefas", (session,args)=>{
    const Pessoa = builder.EntityRecognizer.findAllEntities(args.entities, 'Pessoa').map(m => m.entity).join(',').split(',');
    

    
    request("https://benjamimapi.azurewebsites.net/", (err, res, body) => {
        if(!body) session.send("FALHA NA EXECUÇÃO");
        if(err) session.send("ERRO");
        const tarefas = JSON.parse(body);
        
     for(var i = 0; i < Pessoa.length; i++){
        switch(String(Pessoa[i])){
            case "jorge":
            case "pai":
             session.send("A tarefa diária para o pai é "+ tarefas.Pai);
            break;
            case"onillis":
            case "mãe":
             session.send("A tarefa diária para a mãe é "+ tarefas.Mãe);
            break;
            case "ana":
             session.send("A tarefa diária para a Ana é "+ tarefas.Ana);
            break;
            case "paulo":
             session.send("A tarefa diária para o Paulo é "+ tarefas.Paulo);
            break;
            case "minha":
                session.send("**Tarefa diária por pessoa**\n\n**--------**\n\n **Pai:** "+tarefas.Pai+"\n\n **Mãe:** "+tarefas.Mãe+"\n\n **Ana:** "+tarefas.Ana+"\n\n **Paulo:** "+tarefas.Paulo);
            break;
            default:
                session.send("Desculpe, mas não encontrei nenhuma tarefa para "+Pessoa[i]);
            break;
        };
     };
        
    });
    
});

