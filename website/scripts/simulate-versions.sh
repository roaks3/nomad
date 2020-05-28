NUM_ARCHIVED_VERSIONS=1

i=1
while [ "$i" -le $NUM_ARCHIVED_VERSIONS ]; do
  echo "Creating v$i"
  mkdir pages/v$i
  cp -R pages/api-docs pages/v$i/.
  cp -R pages/docs pages/v$i/.
  cp -R pages/intro pages/v$i/.
  i=$(( i + 1 ))
done
