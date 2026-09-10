<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;

/**
 * Recuerda en sesion los filtros de un listado.
 *
 * Al volver a un listado desde el detalle de un registro la URL llega sin
 * parametros y, sin esto, se pierde lo que el usuario habia filtrado.
 *
 * La regla es: si la peticion trae la clave, manda ese valor aunque venga
 * vacia, porque vaciar un campo es una decision explicita. Si no la trae, se
 * recupera lo guardado. El boton de limpiar envia reset=1 y borra la memoria.
 */
trait RemembersListFilters
{
    /**
     * @param  string  $scope  Identificador del listado, p. ej. 'pagos'
     * @param  array<int, string>  $keys  Claves de filtro que se recuerdan
     * @param  array<string, mixed>  $defaults  Valores por defecto cuando no hay nada guardado
     * @return array<string, mixed>
     */
    protected function rememberedFilters(Request $request, string $scope, array $keys, array $defaults = []): array
    {
        $sessionKey = "list_filters.{$scope}";

        if ($request->boolean('reset')) {
            $request->session()->forget($sessionKey);

            return $this->withDefaults(array_fill_keys($keys, null), $defaults);
        }

        $stored = $request->session()->get($sessionKey, []);
        $filters = [];

        foreach ($keys as $key) {
            if ($request->has($key)) {
                $value = $request->input($key);
                $value = is_string($value) ? trim($value) : $value;
                $filters[$key] = ($value === '' || $value === null) ? null : $value;

                continue;
            }

            $filters[$key] = $stored[$key] ?? null;
        }

        $request->session()->put($sessionKey, $filters);

        return $this->withDefaults($filters, $defaults);
    }

    /**
     * Aplica los valores por defecto solo donde no hay nada seleccionado.
     *
     * @param  array<string, mixed>  $filters
     * @param  array<string, mixed>  $defaults
     * @return array<string, mixed>
     */
    private function withDefaults(array $filters, array $defaults): array
    {
        foreach ($defaults as $key => $default) {
            if (($filters[$key] ?? null) === null) {
                $filters[$key] = $default;
            }
        }

        return $filters;
    }
}
