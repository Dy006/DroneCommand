<?php
/**
 * Created by PhpStorm.
 * User: Dylan
 * Date: 02/01/2016
 * Time: 20:57
 */

try
{
    $bdd = new PDO('mysql:host=localhost;dbname=dgidrone' , 'dgidrone' , 'password');
}
catch(Exception $e)
{
    die('Erreur : '.$e->getMessage());
}