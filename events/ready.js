module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`belepve ${client.user.tag}`);
    client.user.setActivity('Duty sys', { type: 3 }); // meow
  },
};
