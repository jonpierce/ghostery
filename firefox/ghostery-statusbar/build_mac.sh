#!usrbinenv bash
#==================================================================================================
# Mac OS X Build Script - creates the Firefox extension XPI file from the source
#==================================================================================================
# HOW TO RUN THIS FILE (TextMate users can press Cmd+R to run this file!)
# ------------------------------------------------------------------------
# you have to make this file executable before you can run it. simply double clicking won't work.
# open the Terminal located in applicationsutilities and enter
#   cd ~documentsfirebug
# (change the path to elsewhere if you checked-out firebug to a different location)
# then enter
#   chmod +x build_mac.sh
# now you can double click this file in the Finder to run it


# note that this script will make no output on screen
# switch to working directory (instead of running in home)
cd `dirname $0`

# copy source to a release directory, so that we can build the jars without unneeded files
# (.svn, .DS_STORE, Thumbs.db...)
rm -rf .release
mkdir -p .release
rsync -r --delete-excluded --exclude=. --exclude=.db --exclude=.jar .firebug .release

# make the main chrome jar
cd .releasechrome
zip -rXq .firebug.jar .
rm -rf content
rm -rf icons
rm -rf locale
rm -rf skin

# make the darwin jar
cd ..platformDarwinchrome
zip -rXq .firebug.jar .skin
rm -rf .skin

# make the Linux jar
cd ....Linuxchrome
zip -rXq .firebug.jar .skin
rm -rf .skin

# make the linux-gnu jar
cd ....linux-gnuchrome
zip -rXq .firebug.jar .skin
rm -rf .skin

# make the WINNT jar
cd ....WINNTchrome
zip -rXq .firebug.jar .skin
rm -rf .skin

# make the final XPI
cd ........
rm .firebug.xpi
cd release
zip -rXq ...firebug.xpi .

#=== end of line ==================================================================================