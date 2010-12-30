#!/bin/bash

ff_version="2.0.1"
base_dir='/Volumes/Freshzen/ghostery'
firefox_dir="$base_dir/firefox/ghostery-statusbar"
releases_dir="$base_dir/www/firefox/releases"
nss_dir="$base_dir/firefox/nss"
amo_dir="$releases_dir/amo" # Directory to keep AMO specific binaries (no update URL)

function remove_file() {
    if [ $1 ] ; then
        if [ -e $1 ] ; then
            echo "Removing file: $1"
            rm -f "$1"
        fi
    fi
}

remove_file $firefox_dir/ghostery.xpi
remove_file $releases_dir/ghostery-$ff_version.xpi
rm $releases_dir/ghostery.xpi

# Copy current ghostery directory to nss
rm -rf $nss_dir/ghostery-tmp
cp -R ghostery $nss_dir/ghostery-tmp

# Remove cruft
find $nss_dir/ghostery-tmp -name ".DS_Store" | xargs rm
find $nss_dir/ghostery-tmp -name ".svn" | xargs rm -rf
remove_file $nss_dir/ghostery-tmp/chrome/._.DS_Store

# Run signtool from nss directory to deal with library dependancies
cd $nss_dir

#Run signing script
sh sign-firefox.sh

# Go into tmp firefox extension directory
cd ghostery-tmp

# zigbert.rsa has to be first file in XPI
zip ../ghostery.xpi META-INF/zigbert.rsa
zip -r -D ../ghostery.xpi * -x META-INF/zigbert.rsa

mv ../ghostery.xpi $firefox_dir/

cp $firefox_dir/ghostery.xpi $releases_dir/ghostery-$ff_version.xpi

cd $firefox_dir

pushd $releases_dir
ln -s ghostery-$ff_version.xpi ghostery.xpi
popd

echo ''
echo '*------------------------------'
echo '* Extension build successful'
echo '*------------------------------'

echo ''
echo '* Building AMO version'
echo ''

cd $nss_dir/ghostery-tmp

# Remove UpdateURL
sed -i 's/<em:updateURL>/<!--<em:updateURL>/' install.rdf
sed -i 's/<\/em:updateURL>/<\/em:updateURL>-->/' install.rdf
# Remove UpdateKey
sed -i 's/<em:updateKey>/<!--<em:updateKey>/' install.rdf
sed -i 's/<\/em:updateKey>/<\/em:updateKey>-->/' install.rdf

cd ..

#Run signing script
sh sign-firefox.sh

# Go into tmp firefox extension directory
cd ghostery-tmp

# zigbert.rsa has to be first file in XPI
zip ../ghostery-amo.xpi META-INF/zigbert.rsa
zip -r -D ../ghostery-amo.xpi * -x META-INF/zigbert.rsa

mv ../ghostery-amo.xpi $firefox_dir/
#mv $current_dir/ghostery/ghostery-amo.xpi $current_dir/
mv $firefox_dir/ghostery-amo.xpi $amo_dir/ghostery-$ff_version.xpi

echo ''
echo '*------------------------------'
echo '* AMO Extension build successful'
echo '*------------------------------'

cd $firefox_dir
