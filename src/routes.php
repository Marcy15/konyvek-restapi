<?php
declare(strict_types=1);

use App\Controllers\AuthorController;
use App\Controllers\BookController;
use App\Controllers\CategoryController;
use App\Controllers\PublisherController;
use App\Controllers\RatingController;


$authors = new AuthorController();
$publishers = new PublisherController();
$categories = new CategoryController();
$books = new BookController();
$ratings = new RatingController();


$router->add('GET',    '/authors',      [$authors, 'index']);
$router->add('POST',   '/authors',      [$authors, 'store']);
$router->add('GET',    '/authors/{id}', [$authors, 'show']);
$router->add('PATCH',  '/authors/{id}', [$authors, 'update']);
$router->add('DELETE', '/authors/{id}', [$authors, 'destroy']);

$router->add('GET',    '/publishers',      [$publishers, 'index']);
$router->add('POST',   '/publishers',      [$publishers, 'store']);
$router->add('GET',    '/publishers/{id}', [$publishers, 'show']);
$router->add('PATCH',  '/publishers/{id}', [$publishers, 'update']);
$router->add('DELETE', '/publishers/{id}', [$publishers, 'destroy']);

$router->add('GET',    '/categories',      [$categories, 'index']);
$router->add('POST',   '/categories',      [$categories, 'store']);
$router->add('GET',    '/categories/{id}', [$categories, 'show']);
$router->add('PATCH',  '/categories/{id}', [$categories, 'update']);
$router->add('DELETE', '/categories/{id}', [$categories, 'destroy']);

$router->add('GET',    '/books',      [$books, 'index']);
$router->add('POST',   '/books',      [$books, 'store']);
$router->add('GET',    '/books/{id}', [$books, 'show']);
$router->add('PATCH',  '/books/{id}', [$books, 'update']);
$router->add('DELETE', '/books/{id}', [$books, 'destroy']);

$router->add('POST',   '/books/{id}/ratings', [$ratings, 'storeForBook']);
$router->add('GET',    '/ratings',            [$ratings, 'index']);
$router->add('GET',    '/ratings/{id}',       [$ratings, 'show']);
$router->add('PATCH',  '/ratings/{id}',       [$ratings, 'update']);
$router->add('DELETE', '/ratings/{id}',       [$ratings, 'destroy']);
