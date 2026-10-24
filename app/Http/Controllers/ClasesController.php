<?php

namespace App\Http\Controllers;

use App\Support\PublicPrograms;
use App\Support\Seo;
use Inertia\Inertia;

/**
 * Páginas públicas de cada programa (/clases/piano, /clases/canto...), pensadas para
 * posicionar en Google búsquedas como "clases de piano en Ocaña".
 */
class ClasesController extends Controller
{
    public function show(string $slug)
    {
        $program = PublicPrograms::find($slug) ?? abort(404);
        $seo = Seo::forProgram($program);

        return Inertia::render('clases/show', [
            'program' => $program,
            'otherPrograms' => collect(PublicPrograms::all())
                ->reject(fn ($p) => $p['slug'] === $slug)
                ->map(fn ($p) => ['slug' => $p['slug'], 'label' => $p['label'], 'icon' => $p['icon'], 'color' => $p['color']])
                ->values(),
            'faq' => Seo::programFaq($program),
            'modalities' => Seo::modalities(),
            'discount' => Seo::siblingDiscount(),
            'pageTitle' => $seo['title'],
            'business' => collect(config('seo.business'))->only(['street', 'neighborhood', 'locality', 'region', 'whatsapp']),
        ])->withViewData(['seo' => $seo]);
    }
}
