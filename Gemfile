source "https://rubygems.org"

# Mirrors the GitHub Pages build environment for local builds.
gem "github-pages", group: :jekyll_plugins
gem "webrick" # needed for `jekyll serve` on Ruby >= 3

# Windows has no system zoneinfo; Jekyll needs this for `timezone:` (local builds only).
platforms :windows do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end
