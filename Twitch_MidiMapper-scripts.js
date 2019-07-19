/*
 * Script file for Novation Twitch V1.0 for Mixxx 2.2
 *
 *Copyright (C) 2019 Dale Powell
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 */

 //USER OPTIONS

 var fxOnUnitMaster = 1 ;
 // Set to 0 for the main page FX On buttons to toggle On/Off for the four FX units
 // Normal operation (1) and they will route the effects Units to Master output.

var KazasTwitch = {};

// GLOBAL Variables
var globalShift = 0;
var hcHold = 0 ;
var leftDeck = 0 ;
var rightDeck = 0 ;
var fxPage = 0 ;

// INIT Scripts, including saving to MIDI Mapper array
KazasTwitch.init = function (id, debugging) {
    midi.sendShortMsg(0xb7,0x00,0x6f);          // init Advanced Mode
    midi.sendShortMsg(0xb7,0x00,0x00);          // init Basic Mode
    midi.sendShortMsg(0xb7,0x00,0x01);          // Read current controler status (does nothing??)
    midi.sendShortMsg(0xb7,0x00,0x70);          // init Device
//  Advanced mode and back was only way to get it to reset deck paging.
// Nothing seems to correctly Init/restore the FX Params page!!

//Set LEDs which don't currently update on Init
//Need two FXOn modes....
    for (var i = 1; i <= 4; i++){
        if (fxOnUnitMaster == 0) {
            midi.sendShortMsg(0x9b, 0x1f + i,engine.getValue("[EffectRack1_EffectUnit" +i+ "]", "enabled") * 127);
        }
        else {
            midi.sendShortMsg(0x9b, 0x1f + i,engine.getValue("[EffectRack1_EffectUnit" +i+ "]", "group_[Master]_enable") * 127);
        }
    }


    KazasTwitch.deck1 = new KazasTwitch.Deck ([1], 7);
    KazasTwitch.deck2 = new KazasTwitch.Deck ([2], 8);
    KazasTwitch.deck3 = new KazasTwitch.Deck ([3], 9);
    KazasTwitch.deck4 = new KazasTwitch.Deck ([4], 10);

// Decks must be initialised for you to refrence each from MidiMapper.
// MidiMapper Fuctions within Init

for (var i  = 0x97; i  <= 0x9a; i++) {
    for (var j = 0x60; j <= 0x67; j++) {
        MidiMapper.set(i , j, KazasTwitch.hcs) ;
    }
}

for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x17, KazasTwitch.play) ;
}

for (var i = 0x97; i<= 0x9a; i++) {
    MidiMapper.set(i, 0x11, KazasTwitch.globalShift) ;
}

for (var i = 0x97; i<= 0x9a; i++) {
    for (var j = 0x70; j <= 0x77; j++) {
        MidiMapper.set(i, j, KazasTwitch.loops) ;
    }
}

for (var i = 0x97; i<= 0x9a; i++) {
    for (var j = 0x78; j <= 0x7f; j++) {
        MidiMapper.set(i, j, KazasTwitch.rolls) ;
    }
}

for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x16, KazasTwitch.cue) ;
}

for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x10, KazasTwitch.sync) ;
}

for (var i = 0xb7; i <= 0xba; i++) {
    for (var j = 0x46; j <= 0x48; j++) {
        MidiMapper.set(i, j, KazasTwitch.eq) ;
    }
}

for (var i = 0x97; i <= 0x9a; i++) {
    for (var j = 0x68; j <= 0x6f; j++) {
        MidiMapper.set(i, j, KazasTwitch.fxps) ;
    }
}

for (var i = 0xb7; i <= 0xba; i++) {
    MidiMapper.set(i, 0x35, KazasTwitch.strips) ;
}

for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x38, KazasTwitch["deck" + (i - 0x96)].scratch) ;
//    MidiMapper.set(i, 0x38, KazasTwitch.hcShift) ;
}
for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x47, KazasTwitch["deck" + (i - 0x96)].scratchRel) ;
}
for (var i = 0xb7; i <= 0xba; i++) {
    MidiMapper.set(i, 0x34, KazasTwitch.stripDrop) ;
}
for (var i = 0xb7; i <= 0xba; i++) {
    MidiMapper.set(i, 0x03, KazasTwitch.pitchEnc) ;
}
for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x03, KazasTwitch.pitchShiftKey) ;
}
for (var i = 0xb7; i <= 0xba; i++) {
    MidiMapper.set(i, 0x07, KazasTwitch.volume) ;
}
for (var i = 0xb7; i <= 0xba; i++) {
    MidiMapper.set(i, 0x09, KazasTwitch.pregain) ;
}
for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x0d, KazasTwitch.pfl) ;
}
for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x0a, KazasTwitch.quickFX) ;
}

for (var i = 0x00; i <= 0x13; i++) {
    MidiMapper.set(0xbb, i, KazasTwitch.fxKnobs) ;
}

for (var i = 0x1C; i <= 0x1F; i++) {
    MidiMapper.set(0x9b, i, KazasTwitch.fxParams) ;
}

for (var i = 0x20; i <= 0x23; i++) {
    MidiMapper.set(0x9b, i, KazasTwitch.fxOn) ;
}

for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x39, KazasTwitch.showFX) ;
}

for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x12, KazasTwitch.backBut) ;
}
for (var i = 0x97; i <= 0x9a; i++) {
    MidiMapper.set(i, 0x13, KazasTwitch.fwdBut) ;
}


MidiMapper.set(0xb7, 0x55, KazasTwitch.libBrowseEnc) ;
MidiMapper.set(0x97, 0x55, KazasTwitch.libShiftKey) ;
MidiMapper.set(0x97, 0x52, KazasTwitch.loadButtons) ;
MidiMapper.set(0x99, 0x52, KazasTwitch.loadButtons) ;
MidiMapper.set(0x97, 0x53, KazasTwitch.loadButtons) ;
MidiMapper.set(0x99, 0x53, KazasTwitch.loadButtons) ;
MidiMapper.set(0xb7, 0x08, KazasTwitch.xfade) ;
MidiMapper.set(0xb7, 0x06, KazasTwitch.multiEncLeft) ;
MidiMapper.set(0xb8, 0x06, KazasTwitch.multiEncRight) ;
MidiMapper.set(0x97, 0x06, KazasTwitch.multiEncPress) ;
MidiMapper.set(0x98, 0x06, KazasTwitch.multiEncPress) ;
MidiMapper.set(0x97, 0x00, KazasTwitch.deckSet) ;
MidiMapper.set(0x98, 0x00, KazasTwitch.deckSet) ;
MidiMapper.set(0x97, 0x50, KazasTwitch.browser) ;
MidiMapper.set(0x97, 0x51, KazasTwitch.decks24) ;
MidiMapper.set(0x97, 0x54, KazasTwitch.libLeft) ;
MidiMapper.set(0x97, 0x56, KazasTwitch.libRight) ;

// VU Meter CallBack functions
engine.makeConnection("[Channel1]", "VuMeter", KazasTwitch.vuCallback);
engine.makeConnection("[Channel2]", "VuMeter", KazasTwitch.vuCallback);
engine.makeConnection("[Channel3]", "VuMeter", KazasTwitch.vuCallback);
engine.makeConnection("[Channel4]", "VuMeter", KazasTwitch.vuCallback);
engine.makeConnection("[Master]", "VuMeterL", KazasTwitch.vuCallback);
engine.makeConnection("[Master]", "VuMeter", KazasTwitch.vuCallback);

};

// SHutdown scripts
KazasTwitch.shutdown = function() {
    midi.sendShortMsg(0xb7,0x00,0x00);          // init Basic Mode
    midi.sendShortMsg(0xb7,0x00,0x70);          // turn off all LEDs on exit
};

// MAIN CONTROL SCRIPTS

// VU Meters
KazasTwitch.vuCallback = function(value, group, control) {
  if (engine.getValue("[Channel1]", "pfl")) {
    midi.sendShortMsg(0x97, 0x5f, engine.getParameter("[Channel1]", "VuMeter") *127);
  }
  else {
    midi.sendShortMsg(0x97, 0x5f, engine.getParameter("[Master]", "VuMeterL") *127);
  }
  if (engine.getValue("[Channel2]", "pfl")) {
    midi.sendShortMsg(0x98, 0x5f, engine.getParameter("[Channel2]", "VuMeter") *127);
  }
  else {
    midi.sendShortMsg(0x98, 0x5f, engine.getParameter("[Master]", "VuMeterR") *127);
  }
  if (engine.getValue("[Channel3]", "pfl")) {
    midi.sendShortMsg(0x99, 0x5f, engine.getParameter("[Channel3]", "VuMeter") *127);
  }
  else {
    midi.sendShortMsg(0x99, 0x5f, engine.getParameter("[Master]", "VuMeterL") *127);
  }
  if (engine.getValue("[Channel4]", "pfl")) {
    midi.sendShortMsg(0x9a, 0x5f, engine.getParameter("[Channel4]", "VuMeter") *127);
  }
  else {
    midi.sendShortMsg(0x9a, 0x5f, engine.getParameter("[Master]", "VuMeterL") *127);
  }
};

// Keep track of A/C and B/D for multiEnc
KazasTwitch.deckSet = function (channel, control, value, status, group) {
    if (value > 64) {
        if (channel == 7) {
            if (leftDeck == 0) {
                leftDeck = 2 ;
            }
            else {leftDeck = 0 ;
            }
        }
        if (channel == 8) {
            if (rightDeck == 0) {
                rightDeck = 2 ;
            }
            else {rightDeck = 0 ;
            }
        }
    }
};

// ### Functions that are the same across paged decks ###


// Shift across all Decks
KazasTwitch.globalShift = function (channel, control, value, status, group) {
    globalShift = value ;
    KazasTwitch.deck1.shiftKey() ;
    KazasTwitch.deck2.shiftKey() ;
    KazasTwitch.deck3.shiftKey() ;
    KazasTwitch.deck4.shiftKey() ;
    for (fxj = 0; fxj <= 0x13; fxj++) {
        KazasTwitch.fxKnob[fxj].shiftKey() ;
    }
    KazasTwitch.decks_24.shiftKey() ;
    KazasTwitch.bigLib.shiftKey() ;
};

KazasTwitch.shiftKey = function () {
    if (globalShift > 0) {
        this.shift();
    } else {
        this.unshift();
    }
};

// Other Modifier buttons.
// Hut Cue Bank button -- didn't get working as overall modifer for use within Components
KazasTwitch.hcShift = function (channel, control, value, status, group) {
    hcHold = value ;
//    KazasTwitch.deck1.hcHeld() ;
//    KazasTwitch.deck2.hcHeld() ;
//    KazasTwitch.deck3.hcHeld() ;
//    KazasTwitch.deck4.hcHeld() ;
};
/*
KazasTwitch.hcHeld = function () {
    if (hcHold > 0) {
        this.hcshifted();
    } else {
        this.unshift();
    }
};
*/

//LIBRARY
// Library Navigation knob and Press/Shift for faster scrolling
var libShift = 1 ;
var libLast = 1 ;
KazasTwitch.libShiftKey = function (channel, control, value, status, group) {
    if (value > 0x40) {libShift = 10 ;
    }
    else {libShift = 1 ;
    }
};
KazasTwitch.libBrowseEnc = function (channel, control, value, status, group) {
  var libSShift = (globalShift / 13) +1 ;
    if (value > 64) {engine.setValue('[Library]', 'MoveVertical', ((-1) * libLast * (0x80-value) * libShift * libSShift) ) ;
        libLast = (0x80-value);
    }
    else {engine.setValue('[Library]', 'MoveVertical', (libLast * value * libShift * libSShift) ) ;
        libLast = value;
    }
};

// Library pane focusing and Shift to Maximize
KazasTwitch.browser = function (channel, control, value, status, group) {
    KazasTwitch.bigLib.input(channel, control, value, status, group) ;
};
KazasTwitch.bigLib = new components.Button({
    midi: [0x97, (0x50)] ,

    shiftKey: function () {
        if (globalShift > 0) {
            this.shift();
        } else {
            this.unshift();
        }
    },
    unshift: function () {
        this.group = "[Library]" ;
        this.inKey = "MoveFocusForward" ;
        this.outKey = "MoveFocusForward" ;
        this.type = components.Button.prototype.types.push ;
    } ,
    shift: function () {
        this.group = "[Master]";
        this.inKey = "maximize_library" ;
        this.outKey = "maximize_library" ;
        this.type = components.Button.prototype.types.toggle ;
    },
});

// Library Left/Right Expand/Collapse
KazasTwitch.libLeft = function (channel, control, value, status, group) {
    engine.setValue("[Library]", "MoveLeft", value) ;
};
KazasTwitch.libRight = function (channel, control, value, status, group) {
    engine.setValue("[Library]", "MoveRight", value) ;
};

// Toggle number of visilbe decks and Samplers
KazasTwitch.decks24 = function (channel, control, value, status, group) {
    KazasTwitch.decks_24.input(channel, control, value, status, group) ;
};
KazasTwitch.decks_24 = new components.Button({
    midi: [0x97, (0x51)] ,
    type: components.Button.prototype.types.toggle,
    shiftKey: function () {
        if (globalShift > 0) {
            this.shift();
        } else {
            this.unshift();
        }
    },
    unshift: function () {
        this.group = "[Skin]";
        this.inKey = "show_4decks" ;
        this.outKey = "show_4decks" ;
    },
    shift: function () {
        this.group = "[Samplers]";
        this.inKey = "show_samplers" ;
        this.outKey = "show_samplers" ;
    },
});

// Crossfader
KazasTwitch.xfade = function (channel, control, value, status, group) {
    KazasTwitch.xfader.input(channel, control, value, status, group) ;
};
KazasTwitch.xfader = new components.Pot({
    midi: [0xb7, 0x08] ,
    group: "[Master]",
    inKey: "crossfader",
});

// DROP mode of Touchstrip
KazasTwitch.stripDrop = function (channel, control, value, status, group) {
    engine.setValue("[Channel" + (channel-6) + "]", "playposition", (value/128)) ;
};

// Tempo knobs, press for multiplier
var pitchShift = 1 ;
var pitchLast = 1 ;
KazasTwitch.pitchShiftKey = function (channel, control, value, status, group) {
    if (value > 0x40) {pitchShift = 28 ;
      if (globalShift > 0) {engine.setValue("[Channel" + (channel-6) + "]", "rate", 0) ;
      }
    }
    else {pitchShift = 1 ;
    }
};
KazasTwitch.pitchEnc = function (channel, control, value, status, group) {
    var pitch = engine.getValue("[Channel" + (channel-6) + "]", "bpm") ;
    var pitchAdj = (1 / 100) ;
    if (value < 64) {
      engine.setValue("[Channel" + (channel-6) + "]", "bpm", (pitch + (pitchAdj * value * pitchLast * pitchShift))) ;
      pitchLast = value ;
    }
    else {
      engine.setValue("[Channel" + (channel-6) + "]", "bpm", (pitch - (pitchAdj * (0x80-value) * pitchLast * pitchShift))) ;
      pitchLast = (0x80-value) ;
    }

};

// Faders
KazasTwitch.volume = function (channel, control, value, status, group) {
    engine.setParameter("[Channel" + (channel-6) + "]", "volume", (value/128)) ;
};

// Gains
KazasTwitch.pregain = function (channel, control, value, status, group) {
    engine.setValue("[Channel" + (channel-6) + "]", "pregain", (value/64)) ;
};

// FX stuff
// Shift plus FX pad select.
KazasTwitch.showFX = function (channel, control, value, status, group) {
  if (globalShift > 0 && value > 0) {
    engine.setValue("[EffectRack1]", "show", !(engine.getParameter("[EffectRack1]", "show"))) ;
  }
};

// FX Parameter Bank changes with LED updates
KazasTwitch.fxParams = function (channel, control, value, status, group) {
  if (value > 0) {
    if (fxPage == (control- 0x1b)) {
      fxPage = 0 ;
      for (var i = 1; i <= 4; i++){
        if (fxOnUnitMaster == 0) {
          midi.sendShortMsg(0x9b, 0x1f + i,engine.getValue("[EffectRack1_EffectUnit" +i+ "]", "enabled") * 127);
        }
        else {
          midi.sendShortMsg(0x9b, 0x1f + i,engine.getValue("[EffectRack1_EffectUnit" +i+ "]", "group_[Master]_enable") * 127);
        }
      }
    }
    else {
      fxPage = (control - 0x1b) ;
      for (var i = 1; i <= 4; i++) {
        if (i < 4) {
          midi.sendShortMsg(0x9b,(0x1f+i),(engine.getParameter("[EffectRack1_EffectUnit" + fxPage + "_Effect" + i + "]" , "enabled"))*127) ;
        }
        else {
//          midi.sendShortMsg(0x9b,(0x1f+i),(engine.getParameter("[EffectRack1_EffectUnit" + fxPage + "]" , "show_parameters"))*127) ;
// Looked more messy with this enabled then not.
        }
      }
    }
  }
} ;

// FX ON buttons per bank.
KazasTwitch.fxOn = function (channel, control, value, status, group) {
  if (value > 0) {
    if (globalShift == 0) {
      if (fxPage == 0) {
        if (fxOnUnitMaster == 1) {
          engine.setParameter("[EffectRack1_EffectUnit" + (control-0x1f) + "]" , "group_[Master]_enable" ,
          !(engine.getParameter("[EffectRack1_EffectUnit" + (control-0x1f) + "]" , "group_[Master]_enable"))) ;
          midi.sendShortMsg(0x9b,control,(engine.getParameter("[EffectRack1_EffectUnit" + (control-0x1f) + "]" , "group_[Master]_enable"))*127) ;
        }
        else {
          engine.setParameter("[EffectRack1_EffectUnit" + (control-0x1f) + "]" , "enabled" ,
          !(engine.getParameter("[EffectRack1_EffectUnit" + (control-0x1f) + "]" , "enabled")));
          midi.sendShortMsg(0x9b,control,(engine.getParameter("[EffectRack1_EffectUnit" + (control-0x1f) + "]" , "enabled"))*127) ;
        }
      }
      else  { // fxPage > 0
        print(control) ;
        if (control < 0x23) { // first 3 buttons
          engine.setParameter("[EffectRack1_EffectUnit" + fxPage + "_Effect" + (control-0x1f) + "]" , "enabled" ,
          !(engine.getParameter("[EffectRack1_EffectUnit" + fxPage + "_Effect" + (control-0x1f) + "]" , "enabled")));
          midi.sendShortMsg(0x9b,control,(engine.getParameter("[EffectRack1_EffectUnit" + fxPage + "_Effect" + (control-0x1f) + "]" , "enabled"))*127) ;
        }
        else {
          engine.setParameter("[EffectRack1_EffectUnit" + fxPage + "]" , "show_parameters" ,
          !(engine.getParameter("[EffectRack1_EffectUnit" + fxPage + "]" , "show_parameters")));
//          midi.sendShortMsg(0x9b,control,(engine.getParameter("[EffectRack1_EffectUnit" + fxPage + "]" , "show_parameters"))*127) ;
        }
      }
    }
  }
} ;

// FX Knobs
KazasTwitch.fxKnobs = function (channel, control, value, status, group) {
  KazasTwitch.fxKnob[control].input(channel, control, value, status, group) ;
};
KazasTwitch.fxKnob = [] ;
for (var fxi = 0; fxi <= 0x13; fxi++) {
    if (fxi >= 0 && fxi <= 3) {
        KazasTwitch.fxKnob[fxi] = new components.Encoder({
            number: fxi,
            midi: [0xbb, fxi],
            group: "[EffectRack1_EffectUnit" + (fxi + 1) + "]" ,
            unshift: function () {
                this.inKey = "super1" ;
            } ,

           shiftKey: function () {
                if (globalShift > 0) {
                    this.shift();
                } else {
                    this.unshift();
                }
            },
            shift: function () {
                this.inKey = "mix" ;
            },

            input: function (channel, control, value, status, group) {
                if (control%4 == 1 || control%4 == 2) {
                    if (value > 64) {
                        this.inSetParameter(this.inGetParameter() - (.005 * (128-value) * (128-value)));
                    }
                    else if (value < 64) {
                        this.inSetParameter(this.inGetParameter() + (.005 * value) * (value));
                    }
                }
                else {
                    if (this.MSB !== undefined) {
                        value = (this.MSB << 7) + value;
                    }
                    var newValue = this.inValueScale(value);
                    if (this.invert) {
                        newValue = 1 - newValue;
                    }
                    this.inSetParameter(newValue);
                    if (!this.firstValueReceived) {
                        this.firstValueReceived = true;
                        this.connect();
                    }
                }
            },

        });
    }
    else {
       KazasTwitch.fxKnob[fxi] = new components.Encoder({
            number: fxi,
            midi: [0xbb, this.number],
            unshift: function () {
                if (this.number%4 == 3) {
                    this.group = "[EffectRack1_EffectUnit" + (parseInt(this.number/4)) + "]" ;
                    this.inKey = "mix" ;
                }
                else {
                    this.group = "[EffectRack1_EffectUnit" + (parseInt(this.number/4)) + "_Effect" + (this.number%4 + 1) + "]" ;
                    this.inKey = "meta" ;
                }
            } ,

            shiftKey: function () {

                 if (globalShift > 0) {
                     this.shift();
                 } else {
                     this.unshift();
                 }

             },

            shift: function () {

                if (this.number%4 == 3) {
                    this.group = "[EffectRack1_EffectUnit" + (parseInt(this.number/4)) + "]" ;
                    this.inKey = "super1" ;
                }
                else {
                  this.group = "[EffectRack1_EffectUnit" + (parseInt(this.number/4)) + "_Effect" + (this.number%4 + 1) + "]" ;
                  this.inKey = "effect_selector" ;
                }

            } ,

            input: function (channel, control, value, status, group) {
                if (control%4 == 1 || control%4 == 2) {
                    if (value > 64) {
                        this.inSetParameter(this.inGetParameter() - (.005 * (128-value) * (128-value)));
                    }
                    else if (value < 64) {
                        this.inSetParameter(this.inGetParameter() + (.005 * value) * (value));
                    }
                }
                else {
                    if (this.MSB !== undefined) {
                        value = (this.MSB << 7) + value;
                    }
                    var newValue = this.inValueScale(value);
                    if (this.invert) {
                        newValue = 1 - newValue;
                    }
                    this.inSetParameter(newValue);
                    if (!this.firstValueReceived) {
                        this.firstValueReceived = true;
                        this.connect();
                    }
                }
            },

        });
    }
}

// MultiEnc press multiplier function
    var multiPressed = 1;
    KazasTwitch.multiEncPress = function (channel, control, value, status, group) {
        if (value > 0x40) {multiPressed = 10 ;
                    print(multiPressed) ;
        }
        else {multiPressed = 1 ;
        }
    };


// Deck ABCD Components functions:
KazasTwitch.Deck = function(deckNumbers, channel) {
   components.Deck.call(this, deckNumbers);

    this.shiftKey = KazasTwitch.shiftKey ;

//    this.hcHeld = KazasTwitch.hcHeld ;

// Load Deck B/D
    this.loadButtonL = new components.Button({
        midi: [0x90 + channel, 0x52] ,
        group: "[Channel" + (channel-6) + "]",
        inKey: "LoadSelectedTrack" ,
    });

// Loads deck A/C
    this.loadButtonR = new components.Button({
        midi: [0x90 + channel, 0x53] ,
        group: "[Channel" + (channel-5) + "]",
        inKey: "LoadSelectedTrack" ,
    });

    this.playButton = new components.PlayButton([0x90 + channel, 0x17]) ;

    this.cueButton = new components.CueButton([0x90 + channel, 0x16]) ;

    this.syncButton = new components.SyncButton([0x90 + channel, 0x10]) ;

// Fwd button
    this.fwdButt = new components.Button ({
        type: components.Button.prototype.types.toggle ,
        midi: [0x90 + channel, 0x12] ,
        group: "[Channel" + (channel-6) + "]",
        shift: function () {
            this.inKey = "repeat" ;
        },
        unshift: function () {
            this.inKey = "slip_enabled" ;
        },
    });

// Back Button
    this.backButt = new components.Button ({
        type: components.Button.prototype.types.toggle ,
        midi: [0x90 + channel, 0x13] ,
        group: "[Channel" + (channel-6) + "]",
        outKey: "keylock" ,
        shift: function () {
            this.inKey = "reset_key" ;
        },
        unshift: function () {
            this.inKey = "keylock" ;
        },
    });

// PFL/HP Cue
    this.pfl = new components.Button ({
        type: components.Button.prototype.types.toggle ,
        midi: [0x90 + channel, 0x0d] ,
        group: "[Channel" + (channel-6) + "]",
        inKey: "pfl" ,
        outKey: "pfl" ,
    });

// Touchstrip Swipe modes (Drop mode outside of Decks.)
// Including Scraching with HC Bank or Shift buttons
    this.touchStrip = function(channel, control, value, status, group) {
        var amt ;
        if (value < 64) {
            amt = value ;
        }
        else {
            amt = value - 128 ;
        }
        if (hcHold > 64 || globalShift > 64) {
            var alpha = 1.0/8;
            var beta = alpha/32;
            engine.scratchEnable((channel-6), 128, 33+1/3, alpha, beta);
            engine.scratchTick((channel-6), amt); // Scratch
        }
        else {
            engine.setValue("[Channel" + (channel-6) + "]", 'jog', amt); // Pitch bend
        }
    };
    this.scratch = function (channel, control, value, status, group) {
        hcHold = value ;
        if (value == 0) {
            engine.scratchDisable(channel-6) ;
        }
    };
    this.scratchRel = function (channel, control, value, status, group) {
        if (value== 0) {
            engine.scratchDisable(channel-6) ;
        }
    };
// Quick FX On/Off button
    this.quickFX = new components.Button ({
        midi: [0x90 + channel, 0x0a],
        group: "[QuickEffectRack1_[Channel" + (channel-6) + "]_Effect1]" ,
        inKey: "enabled" ,
        outKey: "enabled" ,
        type: components.Button.prototype.types.toggle,

    });

// Quick FX (Multi Encoder) functions
// More functions to be added......
    var multiLast = 1 ;
    this.multiEnc = new components.Encoder ({
        midi: [(0xb0 + channel), 0x06] ,
        input: function (channel, control, value, status, group) {
            if (value > 64) {
                this.inSetParameter(this.inGetParameter() - (.005 * (128-value) * multiLast * multiPressed));
                multiLast = (128-value) ;
            } else if (value < 64) {
                this.inSetParameter(this.inGetParameter() + (.005 * value * multiLast * multiPressed));
                multiLast = value ;
            }
        },
        unshift: function () {
        // If Loops for extra cotrols to be added
            this.group = "[QuickEffectRack1_[Channel" + (channel-6) + "]]" ;
            this.inKey = "super1" ;
        }
    }) ;

// HotCue bank of Pads
    this.hotcuePads = [] ;
    for (var hcbi = 1; hcbi <= 8; hcbi++) {
        this.hotcuePads[hcbi] = new components.HotcueButton({
            midi: [0x90 + channel, 0x5f + hcbi],
            group: "[Channel" + (channel-6) + "]",
            number: hcbi,
        });
    }
// Loop with HC Bank button plus HC Pad
    this.hotcuePadsLoop = function(channel, control, value, status, group) {
      if (hcHold > 64) {
        engine.setParameter("[Channel" + (channel-6) + "]", "beatloop_activate", 1) ;
      }
    };

// FX Pads bank
    this.fxPads = [] ;
    for (var fxpi = 1; fxpi <= 8; fxpi++) {
        if (fxpi <= 4) {
            this.fxPads[fxpi] = new components.Button({
                midi: [0x90 + channel, 0x67 + fxpi],
                number: fxpi,
                unshift: function () {
                    this.type = components.Button.prototype.types.toggle ;
                    this.group = "[EffectRack1_EffectUnit" + (this.number) + "]" ;
                    this.inKey = "group_[Channel" + (channel-6) + "]_enable" ;
                    this.outKey = "group_[Channel" + (channel-6) + "]_enable" ;
                }
            });
        }
        else {
            this.fxPads[fxpi] = new components.SamplerButton({
                midi: [0x90 + channel, 0x67 + fxpi],
                number: fxpi-4 ,
                group: "[Sampler" + ((fxpi-4)+((channel-7)*4)) + "]",
            });
        }
    }

// Loops Pad bank
    this.loopPads = [] ;
    for (var lbi = 1; lbi <= 8; lbi++) {
        this.loopPads[lbi] = new components.Button({
            midi: [0x90 + channel, (0x6f + lbi)],
            group: "[Channel" + (channel-6) + "]",
            number: lbi,
            type: components.Button.prototype.types.push,
            unshift: function () {
                if (1 <= this.number && 4 >= this.number) {
                    var ll = Math.pow(2, this.number) * 2;
                    this.inKey = "beatloop_" + ll + "_toggle" ;
                    this.outKey = "beatloop_" + ll + "_enabled" ;
                }
                else if (this.number == 5) {
                    this.inKey = "loop_halve" ;
                }
                else if (this.number == 6) {
                    this.inKey = "loop_double" ;
                }
                else if (this.number == 7) {
                    this.inKey ="beatloop_activate" ;
                }
                else if (this.number == 8) {
                    this.inKey = "reloop_toggle" ;
                    this.outKey = "loop_enabled" ;
                }
             },
            shift: function () {
              if (this.number == 1 ) {
                  this.inKey = "loop_in" ;
              }
              else if (this.number == 2) {
                  this.inKey = "loop_out" ;
              }
              else if (this.number == 5) {
                  this.inKey = "beatjump_16_backward" ;
              }
              else if (this.number == 6) {
                  this.inKey = "beatjump_4_backward" ;
              }
              else if (this.number == 7) {
                  this.inKey = "beatjump_4_forward" ;
              }
              else if (this.number == 8) {
                  this.inKey = "beatjump_16_forward" ;
              }
            },
        });
    }

// Loop Rool Pad bank
    this.rollPads = [] ;
    for (var rbi = 1; rbi <= 8; rbi++) {
        this.rollPads[rbi] = new components.Button({
            midi: [0x90 + channel, (0x77 + rbi)],
            group: "[Channel" + (channel-6) + "]",
            number: rbi,
            type: components.Button.prototype.types.push,
            unshift: function () {
                if (1 <= this.number && 4 >= this.number) {
                    var ll = Math.pow(2, this.number) / 16;
                    this.inKey = "beatlooproll_" + ll + "_activate" ;
                }
                else if (this.number == 5) {
                    this.inKey = "beatjump_4_backward" ;
                }
                else if (this.number == 6) {
                    this.inKey = "beatjump_1_backward" ;
                }
                else if (this.number == 7) {
                    this.inKey = "beatjump_1_forward" ;
                }
                else if (this.number == 8) {
                    this.inKey = "beatjump_4_forward" ;
                }
            },
            shift: function() {
              if (this.number == 2) {
                  this.inKey = "beats_adjust_slower" ;
              }
              else if (this.number == 3) {
                  this.inKey = "beats_adjust_faster" ;
              }
              else if (this.number == 5) {
                  this.inKey = "bpm_tap" ;
              }
              else if (this.number == 6) {
                  this.inKey = "beats_translate_earlier" ;
              }
              else if (this.number == 7) {
                  this.inKey = "beats_translate_later" ;
              }
              else if (this.number == 8) {
                  this.inKey = "beats_translate_curpos" ;
              }
           }
        });
    }

// EQ Knobs
    this.eqKnob = [] ;
    for (var eqi = 1; eqi <= 3; eqi++){
        this.eqKnob[eqi] = new components.Encoder({
            midi: [0xb0 + channel, 0x45 + eqi],
            group: '[EqualizerRack1_[Channel' + (channel-6) + ']_Effect1]',
            number: eqi,
            unshift: function() {
                this.inKey = "parameter" + this.number ;
            },
        });
    }


    this.reconnectComponents(function(c) {
        if (c.group === undefined) {
            c.group = this.currentDeck;
        }
    });

};

KazasTwitch.Deck.prototype = new components.Deck();


//Grouped call functions to simplify XML below.

// HotCue Pads called here
KazasTwitch.hcs = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    var cueNo = (control - 0x5f) ; // cc to pad/cue number
    KazasTwitch[deckNo].hotcuePads[cueNo].input(channel, control, value, status, group) ;
    KazasTwitch[deckNo].hotcuePadsLoop(channel, control, value, status, group) ;
};

// FX Pads
KazasTwitch.fxps = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    var fxNo = (control - 0x67) ; // cc to fx pad number
    KazasTwitch[deckNo].fxPads[fxNo].input(channel, control, value, status, group) ;
};

 // Loop Pads called here
KazasTwitch.loops = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    var loopNo = (control - 0x6f) ; // cc to loop pad number
    KazasTwitch[deckNo].loopPads[loopNo].input(channel, control, value, status, group) ;
};

 // Loop Roll Pads called here
KazasTwitch.rolls = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    var loopNo = (control - 0x77) ; // cc to roll pad number
    KazasTwitch[deckNo].rollPads[loopNo].input(channel, control, value, status, group) ;
};

// Play Buttons
KazasTwitch.play = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].playButton.input(channel, control, value, status, group) ;
};

KazasTwitch.cue = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].cueButton.input(channel, control, value, status, group) ;
};

KazasTwitch.sync = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].syncButton.input(channel, control, value, status, group) ;
};


KazasTwitch.backBut = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].backButt.input(channel, control, value, status, group) ;
};

KazasTwitch.fwdBut = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].fwdButt.input(channel, control, value, status, group) ;
};


KazasTwitch.strips = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].touchStrip(channel, control, value, status, group) ;
};

KazasTwitch.eq = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    var eqNo = (control - 0x45) ;
    KazasTwitch[deckNo].eqKnob[eqNo].input(channel, control, value, status, group) ;
};

KazasTwitch.loadButtons = function(channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    var side = control%2 ;
    if (side === 0) {KazasTwitch[deckNo].loadButtonL.input(channel, control, value, status, group) ;
    }
   else {KazasTwitch[deckNo].loadButtonR.input(channel, control, value, status, group) ;
    }
};

KazasTwitch.pfl = function (channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].pfl.input(channel, control, value, status, group) ;
};
KazasTwitch.quickFX = function (channel, control, value, status, group) {
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].quickFX.input(channel, control, value, status, group) ;
};
KazasTwitch.multiEncLeft = function (channel, control, value, status, group) {
    channel = channel + leftDeck ;
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].multiEnc.input(channel, control, value, status, group) ;
};
KazasTwitch.multiEncRight = function (channel, control, value, status, group) {
    channel = channel + rightDeck ;
    var deckNo = setDeck(channel) ;
    KazasTwitch[deckNo].multiEnc.input(channel, control, value, status, group) ;
};
function setDeck(channel) {
    if (channel == 7) {return "deck1" ;
    }
    else if (channel == 8) {return "deck2" ;
    }
    else if (channel == 9) {return "deck3" ;
    }
    else {return "deck4" ;
    }
}
