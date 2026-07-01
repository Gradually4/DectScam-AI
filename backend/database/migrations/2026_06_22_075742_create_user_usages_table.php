<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('feature'); // 'text', 'url', 'image', 'chat'
            $table->integer('used_count')->default(0);
            $table->date('date');
            $table->timestamps();

            // Unique constraint to ensure one usage count record per user per feature per day
            $table->unique(['user_id', 'feature', 'date']);
            $table->index(['feature', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_usages');
    }
};
