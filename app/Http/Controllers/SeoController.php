<?php

namespace App\Http\Controllers;

use App\Support\PublicPrograms;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Allow: /',
            '',
            'Sitemap: '.config('seo.url').'/sitemap.xml',
        ];

        return response(implode("\n", $lines)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function sitemap(): Response
    {
        $base = config('seo.url');
        $paths = collect(config('seo.pages'))->pluck('path')
            ->merge(collect(PublicPrograms::all())->map(fn ($p) => '/clases/'.$p['slug']));

        $urls = $paths->map(fn (string $path) => '  <url><loc>'.e($base.$path).'</loc></url>')->implode("\n");

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .$urls."\n"
            .'</urlset>'."\n";

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
