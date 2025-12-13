<?php

// Simular una solicitud POST a /matricula con datos vacíos
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'http://kairos.test/matricula');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'responsable' => [
        'name' => '',
        'last_name' => '',
        'email' => '',
    ],
    'is_minor' => false,
    'payment_commitment' => false,
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: text/html,application/xhtml+xml',
    'X-Inertia: true',
    'X-Inertia-Version: 1',
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

curl_close($ch);

echo "HTTP Code: $httpCode\n\n";
echo "Headers:\n";
echo "========\n";
echo $headers . "\n\n";
echo "Body (first 2000 chars):\n";
echo "========================\n";
echo substr($body, 0, 2000) . "\n";
