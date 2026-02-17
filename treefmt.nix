{
    programs = {
        # keep-sorted start block=yes newline_separated=yes
        deno = {
            enable = true;
            includes = [
                # keep-sorted start
                "docs/"
                "src/"
                # keep-sorted end
                # keep-sorted start
                "README.md"
                "deno.json"
                "manifest.json"
                "package.json"
                "tsconfig.json"
                "vite.config.ts"
                # keep-sorted end
            ];
        };

        keep-sorted = {
            enable = true;
        };

        nixfmt = {
            enable = true;
            width = 80;
            indent = 4;
        };
        # keep-sorted end
    };
}
