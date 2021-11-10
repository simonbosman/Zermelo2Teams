# Teams Zermelo rooster app

De Teams Zermelo rooster app maakt het mogelijk om realtime het huidige rooster, zoals deze in Zermelo staat, in te zien.
De live-view is voor de komende 3 weken en wordt elke 60 sec. ververst.

Het is ook mogelijk om keuze te maken uit de beschikbare keuzevakken en conflicten in het rooster op te lossen. 
Samenvattend is het streven om dezelfde functionaliteit aan te bieden als de webapp van Zermelo, maar dan als een Teamsapp.

De app is een Single Part Page zodat deze als teamstab en als webpart binnen sharepoint weergegeven kan worden.
https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/single-part-app-pages?tabs=pnpposh

## Building

Als IDE wordt Visual Studio Code gebruikt met de Teams Toolkit als extension en node-server version 1.14.

Gulp wordt ingezet als build tool:

- Bundle and minify JavaScript and CSS files.
- Run tools to call the bundling and minification tasks before each build.
- Compile LESS or Sass files to CSS.
- Compile TypeScript files to JavaScript.

Voor een lokale build t.b.v. debugging:
gulp serve --nobrowser

Voor een build t.b.v. installatie:
https://docs.microsoft.com/en-us/sharepoint/dev/spfx/integrate-with-teams-introduction

## Architecture

![Software architecture](/Software_architecture.drawio.png)