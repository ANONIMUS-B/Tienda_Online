<?php

use App\Models\MediaFile;

test('shared uploaded media is served from the database with safe headers', function () {
    $media = MediaFile::query()->create(['id' => (string) str()->uuid(), 'mime_type' => 'image/png', 'size' => 3, 'original_name' => 'test.png', 'contents' => base64_encode('png')]);

    $this->get(route('media.show', $media))->assertOk()->assertHeader('Content-Type', 'image/png')->assertSee('png');
});
