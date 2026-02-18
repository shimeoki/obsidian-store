# Store

This plugin allows the use of folders in Obsidian only one level deep,
effectively flattening the vault.

In the proposed solution, notes have UUIDs as the filenames and documents and
images have hashes as the filenames.

The plugin automates the process of migration to such structure, adds commands
for everyday use and fixes some problems I encountered while exploring this
workflow.

## Motivation

Everyone uses some kind of TODOs in their Obsidian vault. Let's say you have two
projects: A and B. Even for this simple scenario, you have two variants of the
vault structure:

1. `A/todo.md` and `B/todo.md`
2. `todo/A.md` and `todo/B.md`

First solution makes more sense: you have some tasks for a project, so it
resides in the project folder. But the second solution is more convenient for
daily usage: probably you just want to look what you can do to not go through
every project.

This problem gets exponentially worse the more your vault scales horizontally
(projects amount) and vertically (depth level).

That's hierarchy for you. Each file has only one "true" path. But for
note-taking it doesn't align very well.

That's why Obsidian has tags. Instead of hierarchical classification, you can
use faceted classification: attach some descriptors to the note and then use
them for organization.

For the example above, you just use tags like `project/A` or `project/B` and
`todo` for the notes.

You get the benefit of the first solution: you don't really need to have
`todo/A` or `todo/B`: it's just a todo for a certain project, it makes more
sense. And you also get the benefit of the second solution: you can search for a
`todo` tag to just get all TODOs, and you get the context of the project from
the other tag.

I found no reason to keep the hierarchy anymore while using tags, because it's
just mental overhead ("Where do I keep the note?"). This plugin is my attempt at
it.

## Conflicts

So we want to remove hierarchy. If we keep everything in one folder for
simplicity, then we need to resolve filename conflicts. While Obsidian can
resolve this automatically, the resulting filenames with a number suffix don't
look good.

After some thinking, I decided to use UUID (v4):

- Filenames are essentially unique, because the chance of a conflict is almost
  non-existent.

- Using something like a hash doesn't make sense, because notes are not
  immutable. Using a constant identifier reduces the amount of renames.

- Using Zettelkasten-like approaches when the note name reflects it's contents
  requires more mental effort and (probably) cannot be automatized.

- Using a date like Obsidian's core plugin "Unique note creator" does doesn't
  guarantee uniqueness entirely: it's possible to create two notes in one second
  or you can get a note from another person with the same date. Also it's how to
  handle the migration of previous notes to the new naming scheme. UUIDs are
  unique even if you get a note from another person. The conflict can occur if
  notes have the same name deliberately, which is a good thing to notice copies
  or versions of the same note, for example.

- It's not a dependency and easy to generate. It's also a widely recognized
  standard.

From now on, the action of "converting a folder or a note to the plugin format"
is referred as "storing". It's both available as a command for the current file
and for a file/folder in a context menu of the file explorer.

Storing is a general process which tries to convert the vault to the proposed
solution. Based on the enabled features, it won't just rename the notes, but do
something else while at it.

## Filenames

But if we use UUIDs as the filename, how do we address the notes then? We can
forget about the names in the filesystem, so we need to use Obsidian features
for that. Our main weapon is the search.

### H1

Did you know that you can search through all headings in the vault?

You probably already know that you can link to a heading in the current note via
typing `[[#`. But if you type `[[##` instead, you are going to link to any
heading in the vault.

That can be helpful and is a reason to create meaningful headings for your
notes. But aside from that, I just like
[Marksman approach](https://github.com/artempyanykh/marksman/blob/4340227338f8d2b369bf38d19f029f1effb532f6/docs/features.md#wiki-links):
first-level (level 1) heading in the note acts as document's title. I am going
to refer to this as H1 (and H2, H3...) from now on.

This allows to:

- Make the note portable. That's how normal documents work: they have a title
  page with the authors, release date, name and so on. Even if the filename has
  changed, the title page is still the same.

- Use the feature mentioned above more often. If all notes are required to have
  a heading, then this method of linking is guaranteed to list all notes.

- Use all available symbols for a title. Filenames are usually kept with default
  a-Z and numbers without spaces to avoid filesystem issues. If the title is a
  heading (which is just a text in the note), then we can use almost anything we
  want.

Store allows to enable automatic generation of H1 based on the filename:

- If file had no H1, then it's added to the start with the value of the
  filename.
- If file had a blank H1, it's replaced with the filename.
- If file had a single H1, then nothing is done.
- If file had multiple H1s, then all headings are "shifted" one level up (H1's
  become H2s) and H1 is inserted at the start. The operations fails if there is
  at least one H6.

If file already had UUID as the filename, it's simply ignored.

### Aliases

Obsidian has a built-in property for notes: `aliases`. It's a list of strings
like `tags`. Entries in this list are used to refer to the note like a filename.

It's pretty useful to name the note in different languages or just different
titles.

With the Store approach they are almost mandatory to use, because they work for
both links and quick switcher.

As well with the H1, the plugin has an optional feature to generate aliases for
you.

They are generated based on the filename and H1. Filename is not used, if it's a
UUID.

## Benefits

Aside from the advantages of just using headings and aliases listed above, the
overall approach of "forgetting about the filesystem" makes your workflow
different.

Instead of navigating the deep nested folders you just use search. It's usually
much faster and probably even more precise than manual lookup.

I mark this as an advantage, because the manual restriction of the structure
just doesn't allow you to list through folders even if you wanted to. Now you
must adapt and use search, which is in many cases more effective.

Also instead of creating notes that are "just a part of a directory and should
be linked to an index note" you are probably going to create more
"self-contained" notes.

## Issues

Before we continue with the other plugin features, I want to talk about the
disadvantages of the whole "UUID as the filename" thing, because it comes with
significant trade-offs and drawbacks.

This plugin is not a silver bullet and instead of adding/enhancing features it's
drastically changing vault workflow. To help you decide whether to use it or
not, there are some issues I found.

### Obsidian features

First issue is the Obsidian itself: the app uses the filenames for many features
like search, graph, quick switcher, bases, etc..

Don't get me wrong: it's not Obsidian's fault, it's the opposite - the filename
is required and there are no more than a single filename. It makes sense to use
it as a value to represent the file.

But it doesn't make sense for us with the usage of UUIDs. So:

- Graph is essentially unusable for navigating. I don't use it, but be aware.
- You probably want to show aliases in every search with `[aliases:]` query.
  Also search by path or filename doesn't make sense anymore.
- Obsidian Bases are the same as the search in this regard: you want aliases to
  show and don't want to filter by path.
- Quick switcher is mostly fine, because aliases in my experience take priority:
  UUIDs are random and even a part of a real word excludes most of them.
- Many UI elements with the filename probably should be hidden. I use
  [Hider](https://github.com/kepano/obsidian-hider) for this.

### Format

Second issue is the premise of using plain Markdown files. This is a core
concept of Obsidian: it doesn't use a proprietary format and works on a folder
of Markdown notes.

If you use the Store approach, then you are pretty much required to use tags and
aliases. While they are still just Markdown files, they are now pretty specific
and unique Markdown files.

If you want to migrate from Obsidian to something else, you need to find an
application that works with a YAML frontmatter and tags/aliases from it.

It's also difficult to reuse notes from your vault on GitHub or to use your
notes by others if they don't use the plugin.

## New notes

For daily usage you probably wouldn't rename the files to UUIDs manually. Though
you can create the files manually and then store them, I wanted to remove the
friction as much as possible to simplify the workflow.

The plugin has the commands for creating new notes in the Store in new/current
tab or vertical/horizontal split with a default or selected template.

The templates can be configured in settings. It's recommended to add a default
template with a tag like `tagme`, because it is pretty difficult to find a note
you forgot to tag properly and accidentally closed.

## Archive

Because now you can create notes almost effortlessly, it's natural that the
vault becomes cluttered faster. If you don't delete your notes and preserve them
just in case, you will find the archive feature useful.

In "Advanced" section of "Files and links" category in Obsidian settings you can
add excluded paths. The files on this path either fully hidden or less
noticeable in many features of the app.

You can add configured Store's archive folder there. Then, use the configured
archive tag on the notes you want to archive, and on the next storing, if the
feature is enabled, these notes are going to be excluded.

## Pack

Though it's also not guaranteed and very convenient, it's much easier to export
the notes as a ZIP (for example, to share them with your friend) if you use
hierarchical folder structure: you can keep all linked notes under the same
parent.

Now it's pretty much impossible, and you are certainly not going to go through
all linked files manually. The pack feature allows to do this automatically.

It copies the packed files in the configured folder by copying the the file into
it by "absolute vault path" to preserve the links no matter what the user chose
in the settings.

The plugin doesn't go overboard to be contained in Obsidian. The plugin only
gives the files to be exported; external compression and folder removal is on
the user.

## Assets

While at it, I wanted to deduplicate my attachments in the vault, and the whole
concept of keeping everything at the same level aligns well with this feature.

Other files that aren't notes (PDFs, JPEGs, PNGs) are hashed with SHA-256 and
kept in the configured assets folder. These files are assumed to be immutable in
contrast with notes.

While storing, if two assets with the same hash are found, the previous one is
trashed and the new one is renamed. This approach preserves links while removing
duplicates.

Storing the assets again is counter-untuitively faster than the notes, because
plugin assumes the hash is valid and skips the file, if an asset has a valid
SHA-256 filename.

The default is to have a separate `assets` folder, but you can actually use a
"global" attachments Obsidian folder.
