# Novation-Twitch-MIDI-Mapping-for-Mixxx

Installation and use is the same as any of Mixxx MIDI Mapping. Copy both .js files and the .xml file into your Controllers folder within the Resources directory (eg ~/.mixxx/res as default on Linux) and select in Mixxx Preferences.

User guide can viewed by opening the .odt file or at: https://www.mixxx.org/wiki/doku.php/kazakore_twitch_tmp

Notes for Mixxx Developers:
This mapping uses an additonal MIDI Mapper script I developed that removes the need to edit an .xml as it provides one with every possible MIDI message already mapped to this function. During the Init of the controller script this function is called and the functions for the used controllers written into an array. Hence the purpose of the extra .js file and why some things may look rather strange compared to other controller scripts. Although it was easy to map to array for discrete functions I had written myself I found it didn't work as expected when trying to do so for Component based ones inside the Deck object, hence there is a block of code at the end of the script I would hope to be able to merge into the MIDI Mapper calls in the Init section at some point but for now it works and I have neitehr the time nor energy to work out how to make this work. I tried a few things and strangely could get it so the LEDs works (so it defintiely referenced the correct function) but it woudn't trigger the .input() function of the Component and thus I couldn't fire anything off from it.

The MIDI Mapper script has been uploaded to the forum with a proof of concept at: https://www.mixxx.org/forums/viewtopic.php?f=7&t=11677
