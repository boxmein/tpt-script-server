# tpt-script-server

A cracker64 mod manager-compatible Lua script host for The Powder Toy saves.
Links together saves and scripts, provides downloadables, listings and 
metadata. 

It runs as a HTTP server and at the same time serves web pages with listings 
and whatnot and allows users to manage a sort of association system, or, how
the script knows which saves need which data. If the thing ever gets popular,
some sort of cache for scripts can always be implemented clientside.

1. [About](#about)  
2. [Running the server](#server)
3. [Structure](#structure)

<a name="about" id="about"></a>
## About

This site provides a simple way to host The Powder Toy Lua scripts for 
use inside other saves uploaded into the save server. You might need to figure
out someone to write a Lua backside for it to have TPT-integrated functionality.

Here's a listing of what this site does, how to use saves that use it, and how 
to make use of it yourself.


#### The site

You have quite many different URLs that can be requested to provide different 
kinds of data. The site acts as an intermediate to fetch scripts and at the 
same time a browser for scripts you can use with your saves.

**/view/:script**  
A styled and highlighted 'front page' for the given script. You can link 
to these. Useful for just casual browsing.  

**/raw/:script**  
A raw version of the script's source code. Perfect for Lua scripts.  

**/meta/:script**  
Fetch only the metadata in JSON for the given script.

**/list/**  
Get listings of all the scripts that are hosted here, also fancy and styled. 
Find new scripts to use here, as well as short overviews of what it does and 
other metadata.  

**/list/raw**  
Get a raw list of all the scripts that are hosted here for processing. The 
formatting is minimal. Metadata is in JSON form.

**/assocs/:id**  
You can fetch associations created by **/manage/** here. The result will be a space-separated list of script IDs.


**/login/**  
TPTAPI-based login system! The pages below will need you to be logged in.

**/manage/** 
You can manage save-&gt;scripts associations here. Given a save ID, you can
attach scripts to it via IDs. _Ideally_, there'd be a Lua script to automatically
fetch or cache the required scripts for you. *hint*

#### Using saves that may depend on scripts

I have no clue. Have someone write a Lua script to fetch your required script
files and automate the process for you.

Saving alternate data in TPT saves (even as particles) is something shunned by 
TPT admins and developers, thus dependencies have to be saved server-side.

#### Scripts this site serves

A script listing is provided in [/list](/list). I'm not yet guaranteeing anything.

#### Contribute?

You can add scripts to the server by notifying me on some social network 
[\[TPT\]](http://tpt.io/@boxmein), or, well, hosting your own copy of the server. 
Easy enough.
  

<a id="server" name="server"></a>
## Running this

If you have npm it's as easy as two shell commands: 

    npm install
    npm start

If not, get it. npm is useful.


<a id="structure" name="structure"></a>
## Structure

The directories are fairly simply organized:  
**databases/** has a nedb database for associations and another for script metadata,  
**public/** has static website files, such as CSS and images,  
**routes/** has modular parts of the website,  
**scripts/** stores the Lua source files and  
**views/** stores the Jade templates that display the web interface.

The only thing that app.js does is set up routes, everything else is handled 
inside scripts in the routes/ directory. There's a TPTAPI shim, another script 
for managing associations, an index page and then globals.js which contains
TPTAPI keys and other useful matter.


## Credits

I don't know!