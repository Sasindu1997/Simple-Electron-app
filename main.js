const electron = require('electron')
const url = require('url')
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

//Listen for the app
app.on('ready', function(){
    //create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    //load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes:true
    }));
    //Quit app when closed
    mainWindow.on('closed',function() { 
        app.quit();
     });

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

//handle create add window
function createAddWindow(){
     //create new window
     addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
         width: 300,
         height: 200,
         title: 'Add Shopping List Item'
     });
     //load html into window
     addWindow.loadURL(url.format({
         pathname: path.join(__dirname, 'addWindow.html'),
         protocol: 'file:',
         slashes:true
     }))
     //garbage collection handle
     addWindow.on('close', function(){
         addWindow = null;
     });
}

//Catch item:add
ipcMain.on('item:add',function (e, item) {
    console.log(item);
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
});

//create menu template
const mainMenuTemplate = [
    {
        label: 'file',
        submenu:[
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label:'Quite',
                accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//if mac add empty object
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}