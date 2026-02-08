@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Laravel')
<img src="https://laravel.com/img/notification-logo.png" class="logo" alt="Laravel Logo">
@else
<h1 style="color: #92400e; font-size: 24px; font-weight: bold; margin: 0;">
🎵 {!! $slot !!}
</h1>
@endif
</a>
</td>
</tr>
