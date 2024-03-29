var express = require('express');
var router = express.Router();
const axios = require('axios').default;
const axiosRetry = require('axios-retry'); 
axiosRetry(axios, { retries: 3 });

//var OrionAddress = "http://host.docker.internal:1026/v2/entities";
var OrionAddress = "http://localhost:1026/v2/entities";


//ATENTION: We need to modify this template according to the data generated by the sensor

var template_BFL = {  //Necesitamos crear un template para cada mensaje distinto a publicar en el Orion Broker.
    "eCO2": {
        "value": 0,
        "type": "Number"
    },
    "TVOC": {
        "value": 0,
        "type": "Number"
    }
};


var template_ip = {
    "temperatura": {
        "value": 0,
        "type": "Number" //quedar como Number porque es el tipo de dato soportado por QuantumLeap
    },
    "humedad": {
        "value": 0,
        "type": "Number"
    },
    "eCO2": {
        "value": 0,
        "type": "Number"
    },
    "TVOC": {
        "value": 0,
        "type": "Number"
    }
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/lora', function (req, res, next) {
    console.log("Get triggered");
    res.json({ result: "ok" });
});

router.post('/lora', function (req, res, next) {  //Manten esta ruta para los sensores LORA

    console.log("POST triggered coming from LoRA network");
    //console.log(req.body);
    if (req.query.event != 'up') {
        console.log("Event =" + req.query.event);
        console.log("Unsupported event: " + req.params.event);
        res.json({ result: "Unsupported event" });
    } else { //ATENTION: need to be modified
        var objectJSON = JSON.parse(req.body.objectJSON);
        template_BFL.eCO2.value = objectJSON.eCO2;
        template_BFL.TVOC.value = objectJSON.TVOC;

        deviceName = req.body.deviceName;
        //deviceName = "device2";

        deviceExists(deviceName).then(result => {
            console.log(result); //Result is true if devices if already regsitered in Orion

            if (result) {
                console.log("device: "+deviceName+" exists, updating...");

                axios.post(OrionAddress + '/' + deviceName + '/attrs', template_BFL)
                    .then(function (response) {
                        console.log(response.data);
                        res.json({ message: "sensor: " + deviceName + " updated", result: "ok" });
                    });
            } else {
                console.log("device not exists in Orion, registering ...");
                //device not exists in Orion.
                //register device in Orion:  curl localhost:1026/v2/entities -s -S -H 'Content-Type: application/json'
                var registerMessage = Object.assign({}, template_BFL); //we clone the template object to add id and type 
                registerMessage.id = deviceName;
                registerMessage.type = "Lora";

                axios.post(OrionAddress, registerMessage)
                    .then(function (response) {
                        console.log(response.data);
                        res.json({ message: "sensor: " + deviceName + " registered and updated", result: "ok" });
                    });
            }
        });
    }

});

router.post('/ip', function (req, res, next) {  //Esta ruta para los sensores WiFi

    console.log("POST triggered coming from IP network");

    console.log(req.body);
    var objectJSON = JSON.stringify(req.body);  //Creo que te debería funcionar, no estoy seguro.
    objectJSON = JSON.parse(objectJSON);
    //console.log(objectJSON);
    template_ip.eCO2.value = objectJSON.eCO2;
    template_ip.TVOC.value = objectJSON.TVOC;
    template_ip.temperatura.value = objectJSON.temperatura;
    template_ip.humedad.value = objectJSON.humedad;


    //console.log("Value of eCO2: "+template_ip.eCO2.value+". Value of TVOC: "+template_ip.TVOC.value); //Comprueba que te imprima los valores por consola.

    deviceName = objectJSON.deviceName;
    //deviceName = "device2";

    deviceExists(deviceName).then(result => {
        console.log("Device already registered in Orion"); //Result is true if devices if already regsitered in Orion

        if (result) {
            console.log("device: "+deviceName+" exists, updating...");

            axios.post(OrionAddress + '/' + deviceName + '/attrs', template_ip, {timeout: 60000})
                .then(function (response) {
                    if (!response) {
                        console.log("Error en la respuesta al procesar: "+deviceName);
                        res.json({ message: "sensor: " + deviceName + "NOT updated", result: "fail" });
                    }
                    else{
                    console.log("sensor: " + deviceName + " updated");
                    res.json({ message: "sensor: " + deviceName + " updated", result: "ok" });
                    }
                }).catch((err) => console.log(err));
        } else {
            console.log("device not exists in Orion, registering ...");
            //device not exists in Orion.
            //register device in Orion:  curl localhost:1026/v2/entities -s -S -H 'Content-Type: application/json'
            var registerMessage = Object.assign({}, template_ip); //we clone the template object to add id and type 
            registerMessage.id = deviceName;
            registerMessage.type = deviceName;  //aquí puedes identificar el mensaje con el identificador que quieras.

            axios.post(OrionAddress, registerMessage)
                .then(function (response) {
                    console.log(response.data);
                    res.json({ message: "sensor: " + deviceName + " registered and updated", result: "ok" });
                });
        }
    });

});

/*
async function deviceExists(deviceName) {
   
        //We check v2/entities/deviceName if throws a notfound message.
        const response = await axios.get(OrionAddress + '/' + deviceName, {timeout: 30000}).catch(
            (err) => {
                console.log("Estamos aquí");
               // if (err.response.data && err.response.data.error == "NotFound") {
                    console.error("Response 404 no device found in Orion");
                    return false;
               // }
            });
        if (response) {
            //console.log("Method deviceExists: Response: "+JSON.stringify(response.data));
            if (response.data && response.data.error == "NotFound") {
                console.error("Response 404 no device found in Orion");
                return false;
            }
        }        
    
    return true;
}
*/


async function deviceExists(deviceName) {
    console.log("Mocking deviceExists query for device name: "+deviceName);   
    return true;
}



module.exports = router;