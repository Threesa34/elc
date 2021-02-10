module.exports = function (socketio) {


  socketio.on('connection', function(client) {
    console.log('connec user');
    client.on('disconnect', function() {
    console.log("disconnected")
    });
    });
  


     
};