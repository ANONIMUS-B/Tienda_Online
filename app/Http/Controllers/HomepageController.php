<?php

namespace App\Http\Controllers;

use App\Models\HomepageSetting;
use Inertia\Inertia;
use Inertia\Response;

class HomepageController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('welcome', [
            'hero' => HomepageSetting::content(),
        ]);
    }
}
