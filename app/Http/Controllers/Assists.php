<?php
namespace App\Http\Controllers;

use App\Models\Programa;
use Illuminate\Http\Request;
use Inertia\Inertia;
class Assists extends Controller{
public function index()
{
    return Inertia::render('Assists/Index'); 


}
}