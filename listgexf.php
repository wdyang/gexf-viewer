<?php
  $dir = ".";
  $dh = opendir($dir);
  // echo "<select onchange='changePage(this)'>";
  // while (($file = readdir($dh)) !== false) {
  //           echo "<option value='$file'>$file</option>";
  // }
  $a=array();
  while (($file=readdir($dh)) !==false){
	  if(preg_match("/\.gexf$/", $file))
	  $a[]=$file;
  }
  closedir($dh);
  foreach($a as $i){
	  echo "$i</br>";
  }
?>