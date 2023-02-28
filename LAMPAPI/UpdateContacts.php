<?php

	$inData = getRequestInfo();

	$newFirst = $inData["newFirstName"];
	$newLast = $inData["newLastName"];
	$newPhoneNumber = $inData["newPhoneNumber"];
	$newEmailAddress = $inData["newEmailAddress"];
	$id = $inData["id"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	/* Updates the firstName, lastName, phoneNymber, and emailAddress of an existing Contact which is
	   found via the userID  */
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName=?, PhoneNumber= ?, EmailAddress= ? WHERE ID= ?");
		$stmt->bind_param("ssssi", $newFirst, $newLast, $newPhoneNumber, $newEmailAddress, $id);
		$stmt->execute();

		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}


?>