if [ -d doc ] ; then
	rm -rf doc
fi

if [ -d tmp_doc ] ; then
	rm -rf tmp_doc
fi

mkdir tmp_doc
cp controllers/user.js tmp_doc/user.js
cp controllers/superpower.js tmp_doc/superpower.js
cp controllers/superhero.js tmp_doc/superhero.js
cp controllers/helpme.js tmp_doc/helpme.js
apidoc -i tmp_doc/ -o doc/

if [ -d tmp_doc ] ; then
	rm -rf tmp_doc
fi