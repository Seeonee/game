// Initialize the game object and our list of states.
// Also fires the starting state.
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('BootState', BootState);
game.state.add('PreloadState', PreloadState);
game.state.add('TitleMenuState', TitleMenuState);
game.state.add('PlayLevelState', PlayLevelState);
game.state.add('EditLevelState', EditLevelState);
game.state.start('BootState');
