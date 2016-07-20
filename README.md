
# Quran Application 

This Quran application uses only HTML and Javascript.

It uses AJAX which might not work from "file" schema, to make
run it run basic Python web server from the project root:

    python -m SimpleHTTPServer

It will run on port 8000, you can access using the following URL:
<http://localhost:8000/>


# Demo

<http://dev.rayed.com/Quran/>

# Files

I used to files format: "jpg" for page images, and JSON for the actual data.

- img/{page\_num}.jpg: Quran scan of page number "page\_num".
- json/suras.json: list of all Quran Sura with number, name, number of ayas.
- json/page\_{page\_num}.json: For each Quran page we have Aya boundries.
- json/aya\_{sura\_num}\_{aya\_num}.json: For each Aya (using Sura ID + Aya ID as a key) you will have textual
  repressentation, and multiple Tafseers (explination) from different books.

