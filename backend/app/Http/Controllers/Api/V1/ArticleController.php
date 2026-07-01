<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    /**
     * Display a listing of all articles with excerpt.
     */
    public function index()
    {
        $articles = Article::select('id', 'title', 'slug', 'thumbnail', 'content', 'author', 'created_at')
            ->latest()
            ->get()
            ->map(function ($article) {
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'thumbnail' => $article->thumbnail,
                    'author' => $article->author,
                    'created_at' => $article->created_at ? $article->created_at->toISOString() : null,
                    'excerpt' => Str::limit(strip_tags($article->content), 120, '...')
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $articles
        ], 200);
    }

    /**
     * Display the specified article.
     */
    public function show($slug)
    {
        $article = Article::where('slug', $slug)->first();

        if (!$article) {
            return response()->json([
                'status' => 'error',
                'message' => 'Artikel tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'content' => $article->content,
                'thumbnail' => $article->thumbnail,
                'author' => $article->author,
                'created_at' => $article->created_at ? $article->created_at->toISOString() : null,
            ]
        ], 200);
    }

    /**
     * Store a newly created article in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'thumbnail' => 'nullable',
        ]);

        if ($request->hasFile('thumbnail')) {
            $request->validate([
                'thumbnail' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
        } elseif ($request->filled('thumbnail')) {
            $request->validate([
                'thumbnail' => 'string|url',
            ]);
        }

        // Generate unique slug
        $baseSlug = Str::slug($request->title);
        $slug = $baseSlug;
        $counter = 1;
        while (Article::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('articles_thumbnails'), $filename);
            $thumbnailPath = 'articles_thumbnails/' . $filename;
        } else {
            $thumbnailPath = $request->input('thumbnail');
        }

        $article = Article::create([
            'title' => $request->title,
            'slug' => $slug,
            'content' => $request->content,
            'thumbnail' => $thumbnailPath,
            'author' => auth()->user()->name,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Artikel berhasil diterbitkan.',
            'data' => $article
        ], 201);
    }

    /**
     * Update the specified article in storage.
     */
    public function update(Request $request, $id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'status' => 'error',
                'message' => 'Artikel tidak ditemukan.'
            ], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'thumbnail' => 'nullable',
        ]);

        if ($request->hasFile('thumbnail')) {
            $request->validate([
                'thumbnail' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
        } elseif ($request->filled('thumbnail')) {
            $request->validate([
                'thumbnail' => 'string|url',
            ]);
        }

        // Regenerate unique slug if title has changed
        if ($request->title !== $article->title) {
            $baseSlug = Str::slug($request->title);
            $slug = $baseSlug;
            $counter = 1;
            while (Article::where('slug', $slug)->where('id', '!=', $article->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
            $article->slug = $slug;
        }

        if ($request->hasFile('thumbnail')) {
            // Delete old local thumbnail if exists
            if ($article->thumbnail && file_exists(public_path($article->thumbnail))) {
                @unlink(public_path($article->thumbnail));
            }

            $file = $request->file('thumbnail');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('articles_thumbnails'), $filename);
            $article->thumbnail = 'articles_thumbnails/' . $filename;
        } elseif ($request->exists('thumbnail')) {
            $thumbnailInput = $request->input('thumbnail');
            if ($article->thumbnail && $article->thumbnail !== $thumbnailInput && file_exists(public_path($article->thumbnail))) {
                @unlink(public_path($article->thumbnail));
            }
            $article->thumbnail = $thumbnailInput;
        }

        $article->title = $request->title;
        $article->content = $request->content;
        $article->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Artikel berhasil diperbarui.',
            'data' => $article
        ], 200);
    }

    /**
     * Remove the specified article from storage.
     */
    public function destroy($id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'status' => 'error',
                'message' => 'Artikel tidak ditemukan.'
            ], 404);
        }

        // Delete thumbnail file if exists locally
        if ($article->thumbnail && file_exists(public_path($article->thumbnail))) {
            @unlink(public_path($article->thumbnail));
        }

        $article->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Artikel berhasil dihapus.'
        ], 200);
    }
}

