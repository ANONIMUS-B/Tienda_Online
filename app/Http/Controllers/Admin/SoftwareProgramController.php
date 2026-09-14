<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSoftwareProgramRequest;
use App\Http\Requests\UpdateSoftwareProgramRequest;
use App\Models\MediaFile;
use App\Models\SoftwareProgram;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SoftwareProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $catalogType = $request->string('catalog')->toString() === 'programs' ? 'programs' : 'software';

        return Inertia::render('admin/software/index', [
            'programs' => SoftwareProgram::query()
                ->select(['id', 'name', 'slug', 'category', 'platform', 'is_active', 'created_at'])
                ->where('is_own', $catalogType === 'software')
                ->latest()
                ->paginate(25),
            'catalogType' => $catalogType,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('admin/software/create', [
            'catalogType' => $request->string('catalog')->toString() === 'programs' ? 'programs' : 'software',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSoftwareProgramRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'program_file']);
        $data['image_id'] = $this->storeMedia($request->file('image'));
        $data['file_id'] = $this->storeMedia($request->file('program_file'));
        SoftwareProgram::query()->create($data);
        Cache::flush();

        return redirect()->route('admin.software.index', ['current_team' => $request->route('current_team'), 'catalog' => $data['is_own'] ? 'software' : 'programs']);
    }

    /**
     * Display the specified resource.
     */
    public function edit(Team $currentTeam, SoftwareProgram $softwareProgram): Response
    {
        return Inertia::render('admin/software/edit', ['program' => $softwareProgram, 'catalogType' => $softwareProgram->is_own ? 'software' : 'programs']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSoftwareProgramRequest $request, Team $currentTeam, SoftwareProgram $softwareProgram): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'program_file']);
        if ($request->hasFile('image')) {
            $data['image_id'] = $this->storeMedia($request->file('image'));
        }
        if ($request->hasFile('program_file')) {
            $data['file_id'] = $this->storeMedia($request->file('program_file'));
        }
        $softwareProgram->update($data);
        Cache::flush();

        return redirect()->route('admin.software.index', ['current_team' => $request->route('current_team'), 'catalog' => $softwareProgram->is_own ? 'software' : 'programs']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $currentTeam, SoftwareProgram $softwareProgram): RedirectResponse
    {
        $softwareProgram->delete();
        Cache::flush();

        return back();
    }

    private function storeMedia(?UploadedFile $file): ?string
    {
        if (! $file) {
            return null;
        }
        $contents = file_get_contents($file->getRealPath());
        if ($contents === false) {
            return null;
        }
        $id = (string) Str::uuid();
        MediaFile::query()->create(['id' => $id, 'mime_type' => $file->getMimeType() ?: 'application/octet-stream', 'size' => $file->getSize(), 'original_name' => $file->getClientOriginalName(), 'contents' => base64_encode($contents)]);

        return $id;
    }
}
