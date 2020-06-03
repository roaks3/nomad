NUM_ARCHIVED_VERSIONS=19

mkdir content/api-docs-archived

i=1
while [ "$i" -le $NUM_ARCHIVED_VERSIONS ]; do
  echo "Creating v$i"
  cp -R content/api-docs content/api-docs-archived/api-docs-v$i
  cd content/api-docs-archived/api-docs-v$i
  find * -type f | xargs -I {} mv {} ../v$i-{}
  cd ../../..
  rm -rf content/api-docs-archived/api-docs-v$i
  mkdir content/docs-v$i
  cp -R content/docs content/docs-v$i/.
  mkdir content/intro-v$i
  cp -R content/intro content/intro-v$i/.
  i=$(( i + 1 ))
done

mv content/api-docs-archived/* content/api-docs
rm -rf content/api-docs-archived
mv content/docs-v* content/docs
mv content/intro-v* content/intro
