<?php
/**
 * Created by PhpStorm.
 * User: Dylan
 * Date: 02/01/2016
 * Time: 20:57
 */

include "bdd_connect.php";

if($_POST['a'] == 'getWifiCodes') {
    $req = $bdd->prepare('SELECT * FROM wifiCode');
    $req->execute();

    echo json_encode($req->fetchAll());
}
else if($_POST['a'] == 'addWifiCode') {
    $req = $bdd->prepare('INSERT INTO wifiCode(ssid, password) VALUES (?, ?)');
    $req->execute(array($_POST['ssid'], $_POST['password']));

    echo $req->errorCode();
}
else if($_POST['a'] == 'deleteWifiCode') {
    $req = $bdd->prepare('DELETE FROM wifiCode WHERE id = ?');
    $req->execute(array($_POST['id']));

    echo $req->errorCode();
}
else {
    echo 'ERROR';
}