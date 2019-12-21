<?php
// ALLOW TESTING
header("access-control-allow-origin: http://localhost");

//header("access-control-allow-origin: http://localhost:3000");
header('Content-Type: application/json');

if (isset($_POST['PATH'])) {
	if($_POST['PATH'] === '') {
		echo '{"log": "empty_path_given"}';

	} else if (!is_dir($_POST['PATH'])) {
		echo '{"log": "unavailable_path_to_fetch"}';

	} else {
    if (isset($_POST['KEY'])) {

      if ($_POST['KEY'] !== '') {
        $dir = $_POST['PATH'].'/'.$_POST['KEY'];
        echo (@deleteDirectory($dir)?'{"log": "element_removed"}':'{"log": "could_not_remove_element"}');

      } else echo '{"log": "empty_element_name"}';

    } else echo '{"log": "undefined_element_name"}';
	}

} else echo '{"log": "undefined_path_given"}';

function deleteDirectory($dir) {
    if (!file_exists($dir)) return false;
    if (!is_dir($dir)) return unlink($dir);

    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') continue;
        if (!deleteDirectory($dir . '/' . $item)) return false;
    }
    return rmdir($dir);
}
