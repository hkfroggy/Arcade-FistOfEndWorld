#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║  北斗の拳 — Fist of the North Star: Wasteland Brawler        ║
║  Sprite Generator  ·  Anime Edition                          ║
╠══════════════════════════════════════════════════════════════╣
║  Supports two local backends (auto-detected):                ║
║    • ComfyUI       — http://127.0.0.1:8188                   ║
║    • Automatic1111 — http://127.0.0.1:7860                   ║
║                                                              ║
║  Usage:                                                      ║
║    python3 generate_sprites.py              # skip existing  ║
║    python3 generate_sprites.py --regen      # redo ALL       ║
║    python3 generate_sprites.py --only ken   # name filter    ║
║    python3 generate_sprites.py --backend a1111               ║
║    python3 generate_sprites.py --backend comfyui             ║
║    python3 generate_sprites.py --port 8189  # custom port    ║
║    python3 generate_sprites.py --lora "animeLineArt_v20" ║
║    python3 generate_sprites.py --lora none  # skip LoRA      ║
║    python3 generate_sprites.py --lora-weight 0.6             ║
║                                                              ║
║  Optional: pip install pillow  (for transparency removal)    ║
╚══════════════════════════════════════════════════════════════╝
"""

import json, sys, os, time, uuid, argparse, base64, shutil
import urllib.request, urllib.parse, urllib.error
from pathlib import Path

# ── Output directory ────────────────────────────────────────────────
OUT       = Path(__file__).parent / "assets" / "sprites"
CLIENT_ID = str(uuid.uuid4())
TIMEOUT   = 300
STEPS     = 30
CFG       = 7.2

# ── Target canvas resolution (must match index.html W×H) ────────────
CANVAS_W  = 1280
CANVAS_H  = 720
# Scale factor vs the original 800×450 design
_SCALE    = CANVAS_W / 800   # 1.6 for 720p

# ── Pillow ──────────────────────────────────────────────────────────
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("⚠  Pillow not found — sprites will have black backgrounds.")
    print("   Install:  pip install pillow\n")

# ══════════════════════════════════════════════════════════════════
#  STYLE PROMPTS
# ══════════════════════════════════════════════════════════════════
QUALITY_PREFIX = (
    "masterpiece, best quality, "
    "classic 1980s anime style, Hokuto no Ken anime art, "
    "Toei Animation, cel-shaded illustration, "
    "bold black outlines, vibrant flat colors with highlights, "
    "dynamic expressive pose, clean professional anime art, "
)
CHAR_SUFFIX = (
    "full body character, centered, facing right, "
    "pure black background, no background details, isolated figure, "
    "sharp clean lines, anime game character art"
)
NEG = (
    "blurry, deformed, bad anatomy, extra limbs, missing limbs, "
    "merged body parts, watermark, text, signature, border, frame, "
    "photorealistic, 3d render, low quality, jpeg artifacts, "
    "duplicate, cropped, partial body, floating parts, "
    "bad proportions, ugly face, chibi, super deformed, "
    "western cartoon, pixel art, sketch only, monochrome, "
    "dark muddy colors, overexposed, washed out"
)
BG_NEG = (
    "characters, people, figures, text, watermark, logo, "
    "blurry, low quality, photorealistic, 3d render, "
    "modern buildings, cars, anachronistic objects"
)

# ══════════════════════════════════════════════════════════════════
#  SPRITE DEFINITIONS
# ══════════════════════════════════════════════════════════════════
# ── Character base descriptions (reused across every frame prompt) ───
_KEN = (
    "Kenshiro from Hokuto no Ken, extremely muscular heroic warrior, "
    "torn dark blue denim jacket seven stars Big Dipper on chest, "
    "dark jeans tucked into worn boots, spiky black hair with front bangs, "
    "intense piercing eyes, two vertical scars on face, "
)
_REI = (
    "Rei from Hokuto no Ken, slender elegant athletic warrior, "
    "white martial arts gi with blue trim and sash, "
    "extremely long flowing silver-blue hair past waist, "
    "calm deadly expression, graceful crane fighting style, "
)
_TOKI = (
    "Toki from Hokuto no Ken, tall graceful man, "
    "flowing white and blue Hokuto robes with long sleeves, "
    "long silky dark hair, serene compassionate face, "
    "gentle but powerful bearing, pressure-point healer fighter, "
)

SPRITES = [
    # ════════════════════════════════════════════════════════════════════
    #  KENSHIRO  — 6 frames per animation, reference: uploaded sprite sheet
    #  Style: dark navy torn denim jacket, silver shoulder pads, muscular,
    #          black spiky hair, 7 Big Dipper stars on chest, two scars on face
    # ════════════════════════════════════════════════════════════════════
    ("kenshiro_idle", 512, 768, 76, 114, [
        # f0 — neutral guard: weight centred, left fist mid-chest, right fist at waist
        QUALITY_PREFIX + _KEN +
        "standing guard stance, weight evenly distributed, left fist raised to chest height, "
        "right fist at waist level, slight forward lean, feet shoulder-width apart, "
        "intense gaze forward, calm readiness, " + CHAR_SUFFIX,

        # f1 — shift: weight slightly forward, fists fractionally higher
        QUALITY_PREFIX + _KEN +
        "guard stance weight shifting forward slightly, left fist chest-high, "
        "right fist rising to mid-torso, subtle forward lean increase, "
        "muscles tensing, alert expression, " + CHAR_SUFFIX,

        # f2 — raise: both fists higher, shoulders lifting
        QUALITY_PREFIX + _KEN +
        "high guard stance, left fist at chin level, right fist at chest level, "
        "shoulders slightly raised, weight on balls of feet, "
        "ready to strike at any moment, " + CHAR_SUFFIX,

        # f3 — peak guard: left fist at face level, right at shoulder
        QUALITY_PREFIX + _KEN +
        "peaked guard position, left fist raised to face level protecting jaw, "
        "right fist at shoulder level cocked back, chin tucked, "
        "maximum readiness fighting stance, " + CHAR_SUFFIX,

        # f4 — settle: fists lowering back to mid
        QUALITY_PREFIX + _KEN +
        "guard settling back down, left fist lowering from face to chest, "
        "right fist returning to mid-torso, exhaling slightly, "
        "subtle muscle relaxation while staying ready, " + CHAR_SUFFIX,

        # f5 — return: back near f0, completing breath cycle
        QUALITY_PREFIX + _KEN +
        "returning to base guard stance, left fist at chest level, "
        "right fist at waist, weight balanced, completing breathing cycle, "
        "steady intense focus, " + CHAR_SUFFIX,
    ]),

    ("kenshiro_walk", 512, 768, 76, 114, [
        # f0 — left-contact: left heel strikes ground, right arm forward
        QUALITY_PREFIX + _KEN +
        "walking cycle frame 1, LEFT foot heel striking ground, "
        "right arm swinging forward at chest level, left arm pulled back, "
        "body rotated slightly right, determined stride, " + CHAR_SUFFIX,

        # f1 — left-mid: weight transferring over left foot
        QUALITY_PREFIX + _KEN +
        "walking cycle frame 2, weight transferring over left flat foot, "
        "body at lowest point, arms centred, knees slightly bent, "
        "mid-stride transition, " + CHAR_SUFFIX,

        # f2 — left-push: left leg pushing off, right foot lifting
        QUALITY_PREFIX + _KEN +
        "walking cycle frame 3, left leg pushing off ground behind, "
        "right foot lifting off, left arm swinging forward, "
        "body rising, powerful purposeful stride, " + CHAR_SUFFIX,

        # f3 — right-contact: right heel strikes, left arm forward (mirror of f0)
        QUALITY_PREFIX + _KEN +
        "walking cycle frame 4, RIGHT foot heel striking ground, "
        "left arm swinging forward at chest level, right arm pulled back, "
        "body rotated slightly left, mirror of frame 1, confident march, " + CHAR_SUFFIX,

        # f4 — right-mid: weight over right foot
        QUALITY_PREFIX + _KEN +
        "walking cycle frame 5, weight transferring over right flat foot, "
        "body at lowest point, arms centred at sides, "
        "mid-stride transition mirrored, " + CHAR_SUFFIX,

        # f5 — right-push: right leg pushes, left foot lifting
        QUALITY_PREFIX + _KEN +
        "walking cycle frame 6, right leg pushing off ground behind, "
        "left foot lifting off, right arm swinging forward, "
        "completing full stride cycle, " + CHAR_SUFFIX,
    ]),

    ("kenshiro_punch", 512, 768, 76, 114, [
        # f0 — guard: starting position before punch
        QUALITY_PREFIX + _KEN +
        "pre-punch guard stance, both fists at chest level in ready position, "
        "weight evenly distributed, feet planted, "
        "about to unleash a powerful punch, " + CHAR_SUFFIX,

        # f1 — windup: right arm pulled all the way back, left guard high
        QUALITY_PREFIX + _KEN +
        "punch wind-up, right arm pulled far back at shoulder height, elbow behind body, "
        "left fist raised high guarding face, upper body twisting back-right, "
        "coiling power before the strike, " + CHAR_SUFFIX,

        # f2 — half-extend: right arm shooting forward, halfway
        QUALITY_PREFIX + _KEN +
        "punch mid-extension, right arm shooting forward at half reach, "
        "left arm pulling back for counterbalance, body rotating forward, "
        "explosive hip rotation powering the punch, " + CHAR_SUFFIX,

        # f3 — IMPACT: right arm FULLY extended, fist at face level, impact flash
        QUALITY_PREFIX + _KEN +
        "PUNCH IMPACT full extension, right arm completely extended at face height, "
        "closed fist at maximum reach, left arm pulled back at hip, "
        "dramatic impact, explosive speed lines from fist, bright impact flash, "
        "body lunging slightly forward with the blow, " + CHAR_SUFFIX,

        # f4 — follow-through: arm still extended, body following
        QUALITY_PREFIX + _KEN +
        "punch follow-through, right arm still extended but beginning to retract, "
        "body weight forward from the blow, left arm at mid-body, "
        "after-impact momentum, " + CHAR_SUFFIX,

        # f5 — retract: right arm pulling back to guard
        QUALITY_PREFIX + _KEN +
        "punch retraction, right arm pulling back from extended position toward guard, "
        "left fist rising back to chest level, "
        "returning to fighting stance after the strike, " + CHAR_SUFFIX,
    ]),

    ("kenshiro_kick", 512, 768, 76, 114, [
        # f0 — crouch: body loading up, knees bent, preparing jump kick
        QUALITY_PREFIX + _KEN +
        "jump kick preparation, both knees bent in deep crouch, "
        "feet flat on ground, arms at sides ready to thrust up, "
        "body coiling like a spring before explosive kick, " + CHAR_SUFFIX,

        # f1 — push-off: leaving ground, body rising
        QUALITY_PREFIX + _KEN +
        "jump kick push-off, leaving the ground, body rising, "
        "both feet pushing off, arms spreading for momentum, "
        "airborne launch, legs beginning to tuck, " + CHAR_SUFFIX,

        # f2 — knee-chamber: right knee pulled high to chest while airborne
        QUALITY_PREFIX + _KEN +
        "jump kick knee chamber, airborne, right knee pulled high to chest level, "
        "left leg slightly bent, arms spreading wide for balance, "
        "chambering the kick for maximum extension, " + CHAR_SUFFIX,

        # f3 — FULL KICK: right leg FULLY extended horizontally at head height
        QUALITY_PREFIX + _KEN +
        "JUMP KICK full extension, right leg completely extended horizontally at head height, "
        "boot-sole leading the impact, left leg slightly bent behind, "
        "left arm thrust back for balance, right arm counterweight, "
        "powerful airborne side kick with impact explosion effect, " + CHAR_SUFFIX,

        # f4 — retract: leg pulling back after impact
        QUALITY_PREFIX + _KEN +
        "jump kick leg retracting after impact, right leg pulling back from extended position, "
        "airborne, beginning descent, arms adjusting for landing, " + CHAR_SUFFIX,

        # f5 — land: both feet touching down, absorbing impact
        QUALITY_PREFIX + _KEN +
        "jump kick landing, both feet touching down on ground, "
        "knees bent absorbing impact, arms forward for balance, "
        "landing from aerial kick in fighting stance, " + CHAR_SUFFIX,
    ]),

    ("kenshiro_special", 512, 768, 76, 114, [
        # f0 — tense: body stiffening, fists clenching hard
        QUALITY_PREFIX + _KEN +
        "special move start, standing upright body tensing dramatically, "
        "both fists clenched at sides pressing inward, muscles bulging visibly, "
        "jacket straining at seams, teeth clenched, " + CHAR_SUFFIX,

        # f1 — ripping: jacket seams splitting, energy building
        QUALITY_PREFIX + _KEN +
        "jacket ripping, jacket seams splitting at the chest and shoulders, "
        "rips and tears appearing across the fabric, "
        "energy crackling around body, muscles expanding beyond jacket limits, "
        "screaming with effort, " + CHAR_SUFFIX,

        # f2 — bursting: jacket exploding outward, fragments flying
        QUALITY_PREFIX + _KEN +
        "jacket bursting apart, jacket violently exploding off the body, "
        "torn fabric fragments flying outward, "
        "electric energy aura erupting around the muscular torso, "
        "intense scream, arms slightly spread, " + CHAR_SUFFIX,

        # f3 — BARE: jacket completely gone, muscular torso exposed, 7 stars glowing
        QUALITY_PREFIX + _KEN +
        "bare muscular torso fully exposed, jacket completely gone, "
        "seven Big Dipper stars on bare chest glowing with golden light, "
        "powerfully muscular body in fighting stance, "
        "energy aura surrounding body, intense battle roar, " + CHAR_SUFFIX,

        # f4 — arms spread: both arms wide open, lightning crackling
        QUALITY_PREFIX + _KEN +
        "arms spread wide open, bare muscular torso, both arms extended outward, "
        "crackling blue-white lightning and energy streaming from hands, "
        "massive power aura explosion surrounding entire body, "
        "seven stars on chest blazing bright gold, head tilted back roaring, " + CHAR_SUFFIX,

        # f5 — power stance: arms return, charged ready stance
        QUALITY_PREFIX + _KEN +
        "ultimate power stance, bare muscular chest with seven glowing stars, "
        "arms returned to fighting guard position, energy aura settled around body, "
        "calm intense eyes, supreme confidence, ready to fight, " + CHAR_SUFFIX,
    ]),

    ("kenshiro_jump", 512, 768, 76, 114, [
        # f0 — crouch prep: loading jump
        QUALITY_PREFIX + _KEN +
        "jump preparation crouch, knees deeply bent, body lowered, "
        "arms pulled back ready to thrust, about to leap, " + CHAR_SUFFIX,

        # f1 — push-off: feet leaving ground
        QUALITY_PREFIX + _KEN +
        "jump push-off, feet leaving the ground, body thrusting upward, "
        "legs straightening explosively, arms swinging upward, " + CHAR_SUFFIX,

        # f2 — ascending tuck: airborne rising, legs starting to tuck
        QUALITY_PREFIX + _KEN +
        "ascending airborne, body rising, knees tucking upward, "
        "arms spreading slightly, feet off ground ascending, " + CHAR_SUFFIX,

        # f3 — peak: maximum height, knees tucked, arms balanced
        QUALITY_PREFIX + _KEN +
        "jump peak height, maximum elevation airborne, both knees tucked to chest, "
        "arms spread wide for aerial balance, feet tucked, " + CHAR_SUFFIX,

        # f4 — descending: legs extending, preparing to land
        QUALITY_PREFIX + _KEN +
        "descending from jump, body falling, legs beginning to extend downward, "
        "arms adjusting position for landing, " + CHAR_SUFFIX,

        # f5 — land absorption: feet down, knees bending on impact
        QUALITY_PREFIX + _KEN +
        "landing absorption, feet touching ground, knees bending to absorb impact, "
        "arms forward for balance, returning to ground stance, " + CHAR_SUFFIX,
    ]),

        # ════════════════════════════════════════════════════════════════════
    #  REI
    # ════════════════════════════════════════════════════════════════════
    ("rei_idle", 512, 768, 70, 108, [
        QUALITY_PREFIX + _REI +
        "idle crane stance, one hand forward fingers extended like blades, "
        "other hand low, weight on back foot, "
        "serene deadly expression, long hair settled, "
        "Nanto Suicho Ken ready position, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "idle breathing, slight shift in weight, "
        "fingers flexing slightly, hair shifting gently, "
        "calm scan of surroundings, "
        "graceful stillness with inner tension, " + CHAR_SUFFIX,
    ]),

    ("rei_walk", 512, 768, 70, 108, [
        QUALITY_PREFIX + _REI +
        "walking frame 1, left foot forward elegant step, "
        "right arm extended forward fingertips leading, "
        "long hair flowing behind, gliding movement, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "walking frame 2, feet together transition, "
        "arms at sides fluid motion, "
        "hair settling mid-step, body upright graceful, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "walking frame 3, right foot forward elegant step, "
        "left arm extended forward, mirror of frame 1, "
        "long hair streaming behind, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "walking frame 4, feet together rising, "
        "fluid transition between strides, "
        "hair gently in motion, " + CHAR_SUFFIX,
    ]),

    ("rei_punch", 512, 768, 70, 108, [
        QUALITY_PREFIX + _REI +
        "SLASH windup, right arm pulled back cocked, "
        "five fingertips glowing blue-white cutting energy, "
        "body weight loading onto back leg, "
        "preparing lethal fingertip slash, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "SLASH impact, right arm FULLY EXTENDED fingertip slash, "
        "five blue-white energy blades at full reach, "
        "slicing through air at enemy, precise lethal strike, "
        "blue nanto energy cutting lines, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "SLASH retract, arm returning after strike, "
        "fingers still glowing, body resetting, " + CHAR_SUFFIX,
    ]),

    ("rei_kick", 512, 768, 70, 108, [
        QUALITY_PREFIX + _REI +
        "SPINNING KICK windup, body beginning rotation, "
        "right leg lifting, arms spreading for momentum, "
        "long hair starting to fan outward from spin, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "SPINNING KICK impact, right leg FULLY EXTENDED horizontal, "
        "body rotated 90 degrees, long hair fanned out beautifully, "
        "acrobatic graceful yet devastating kick, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "SPINNING KICK landing, completing rotation, "
        "foot touching down, hair settling from spin, " + CHAR_SUFFIX,
    ]),

    ("rei_special", 512, 768, 70, 108, [
        QUALITY_PREFIX + _REI +
        "NANTO HAJA KEN frame 1, arms spreading wide gathering energy, "
        "blue-white nanto star materializing at chest, "
        "hair rising with power, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "NANTO HAJA KEN frame 2, dozens of razor blue feather energy blades "
        "erupting outward in all directions, massive explosion of cutting energy, "
        "hair whipping wildly, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "NANTO HAJA KEN frame 3, feather blades dispersing outward, "
        "arms at full spread, maximum energy release, "
        "devastating area attack, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "NANTO HAJA KEN aftermath, arms slowly lowering, "
        "residual blue energy fading, "
        "calm after ultimate technique, " + CHAR_SUFFIX,
    ]),

    ("rei_jump", 512, 768, 70, 108, [
        QUALITY_PREFIX + _REI +
        "JUMP ascending, feet leaving ground, "
        "body straight as arrow launching upward, "
        "long hair streaming downward like comet tail, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _REI +
        "JUMP aerial attack position, fully airborne, "
        "both hands extended fingertips ready, "
        "serene aerial pose hair streaming upward, " + CHAR_SUFFIX,
    ]),

    # ════════════════════════════════════════════════════════════════════
    #  TOKI
    # ════════════════════════════════════════════════════════════════════
    ("toki_idle", 512, 768, 72, 110, [
        QUALITY_PREFIX + _TOKI +
        "gentle idle stance, hands at chest fingertips touching, "
        "serene expression, robes settled, "
        "pressure-point master calm before the fight, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "breathing stance, slight expansion of chest, "
        "fingers separating slightly, "
        "aura of healing ki radiating gently, " + CHAR_SUFFIX,
    ]),

    ("toki_walk", 512, 768, 72, 110, [
        QUALITY_PREFIX + _TOKI +
        "walking frame 1, left foot forward graceful step, "
        "robes flowing, right arm forward, "
        "dignified gentle movement, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "walking frame 2, feet together transition, "
        "robes settling, hair in gentle motion, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "walking frame 3, right foot forward, left arm forward, "
        "mirror of frame 1, elegant stride, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "walking frame 4, feet together rising, "
        "flowing robes at peak of step, " + CHAR_SUFFIX,
    ]),

    ("toki_punch", 512, 768, 72, 110, [
        QUALITY_PREFIX + _TOKI +
        "pressure-point strike windup, right hand pulled back, "
        "two fingers extended like needles glowing pale blue, "
        "precision targeting expression, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "pressure-point strike impact, two fingers FULLY EXTENDED forward, "
        "pale blue ki concentrated at fingertip needle points, "
        "surgically precise lethal strike, gentle face belying deadly power, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "pressure-point strike retract, fingers returning, "
        "ki dissipating, serene after strike, " + CHAR_SUFFIX,
    ]),

    ("toki_kick", 512, 768, 72, 110, [
        QUALITY_PREFIX + _TOKI +
        "graceful kick windup, right knee raised, "
        "robes gathering around raised leg, "
        "calm controlled movement, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "graceful kick extended, right leg fully extended, "
        "robes billowing from motion, elegant powerful kick, "
        "gentle expression with devastating force, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "graceful kick landing, foot returning, "
        "robes settling, balanced recovery, " + CHAR_SUFFIX,
    ]),

    ("toki_special", 512, 768, 72, 110, [
        QUALITY_PREFIX + _TOKI +
        "MUSOU TENSEI frame 1, arms raising to heaven gathering ki, "
        "pale blue-white aura beginning to form around body, "
        "eyes half-closed in concentration, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "MUSOU TENSEI frame 2, massive ki aura exploding outward, "
        "robes blown back by force, hair streaming, "
        "transcendent healing energy weaponized, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "MUSOU TENSEI frame 3, both palms thrust forward, "
        "devastating pressure-point shockwave, "
        "pale blue ki wave expanding outward, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "MUSOU TENSEI aftermath, slowly lowering arms, "
        "residual ki dissipating, "
        "serene composure after ultimate technique, " + CHAR_SUFFIX,
    ]),

    ("toki_jump", 512, 768, 72, 110, [
        QUALITY_PREFIX + _TOKI +
        "JUMP ascending, robes billowing downward, "
        "ascending gracefully with controlled power, "
        "hair streaming, " + CHAR_SUFFIX,

        QUALITY_PREFIX + _TOKI +
        "JUMP aerial, fully airborne, "
        "robes spread like wings, hands ready, "
        "serene aerial mastery, " + CHAR_SUFFIX,
    ]),

    # ════════════════════════════════════════════════════════════════════
    #  ENEMY GRUNT
    # ════════════════════════════════════════════════════════════════════
    ("enemy_idle", 512, 768, 62, 90, [
        QUALITY_PREFIX +
        "generic wasteland thug enemy grunt, muscular scarred man, "
        "leather armor and torn clothing, mohawk or shaved head, "
        "menacing aggressive stance, tattoos, "
        "post-apocalyptic gang member, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "wasteland thug enemy shifting weight, "
        "same scarred muscular man slight weight shift, "
        "aggressive restless energy, " + CHAR_SUFFIX,
    ]),

    ("enemy_walk", 512, 768, 62, 90, [
        QUALITY_PREFIX +
        "wasteland thug walking aggressively toward camera frame 1, "
        "left foot forward, right arm swinging, "
        "intimidating approach, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "wasteland thug walking frame 2 feet together, "
        "arms at sides, aggressive stride, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "wasteland thug walking frame 3 right foot forward, "
        "left arm swinging, mirror of frame 1, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "wasteland thug walking frame 4 transition, "
        "completing stride cycle, " + CHAR_SUFFIX,
    ]),

    ("enemy_attack", 512, 768, 62, 90, [
        QUALITY_PREFIX +
        "wasteland thug windup attack, right fist pulled way back, "
        "lunging forward, angry yell, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "wasteland thug punch impact, fist FULLY EXTENDED forward, "
        "full force wild brawler punch, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "wasteland thug after punch, arm retracting, "
        "body recovering from missed or landed strike, " + CHAR_SUFFIX,
    ]),

    # ════════════════════════════════════════════════════════════════════
    #  BOSS — SPADE
    # ════════════════════════════════════════════════════════════════════
    ("boss_spade_idle", 576, 832, 92, 136, [
        QUALITY_PREFIX +
        "Spade villain boss from beat em up game, "
        "tall menacing man black leather jacket red trim spade symbol on chest, "
        "slicked-back dark hair, diagonal scar on face, "
        "crossed arms contemptuous stance, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "Spade villain boss slight weight shift, "
        "same black leather jacket red trim, uncrossing arms slightly, "
        "cold arrogant smirk, " + CHAR_SUFFIX,
    ]),

    ("boss_spade_attack", 576, 832, 92, 136, [
        QUALITY_PREFIX +
        "Spade boss attack windup, lunging forward dramatically, "
        "right arm raised overhead dark energy gathering, "
        "coat flaring, sadistic grin, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "Spade boss attack impact, devastating overhead SLASH downward, "
        "dark energy extending from hand like blade, "
        "coat flying, destructive strike, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "Spade boss attack recovery, arm returning after slash, "
        "dark energy dissipating, cold expression, " + CHAR_SUFFIX,
    ]),

    # ════════════════════════════════════════════════════════════════════
    #  BOSS — HEART
    # ════════════════════════════════════════════════════════════════════
    ("boss_heart_idle", 576, 832, 116, 162, [
        QUALITY_PREFIX +
        "Heart King villain boss, "
        "enormous massively obese yet muscular man, "
        "heart playing card symbol on chest, "
        "rolls of fat over immense muscle, tiny cruel eyes, "
        "arms at sides imposing mountain of flesh, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "Heart King boss breathing, "
        "same enormous man chest heaving, "
        "shifting weight slightly, ground-shaking presence, " + CHAR_SUFFIX,
    ]),

    ("boss_heart_attack", 576, 832, 116, 162, [
        QUALITY_PREFIX +
        "Heart King boss attack windup, "
        "enormous body rearing back, massive arm raised, "
        "fat and muscle jiggling with motion, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "Heart King boss SLAM attack, "
        "both massive fists slamming downward together, "
        "ground-shaking impact pose, devastating area attack, " + CHAR_SUFFIX,

        QUALITY_PREFIX +
        "Heart King boss attack recovery, "
        "enormous arms returning, body resettling, "
        "shockwaves still visible, " + CHAR_SUFFIX,
    ]),

    # ════════════════════════════════════════════════════════════════════
    #  BACKGROUNDS  (single frame — no animation)
    # ════════════════════════════════════════════════════════════════════
    ("bg_wasteland", 1536, 512, 2560, 720, [
        QUALITY_PREFIX +
        "post-apocalyptic wasteland scrolling background, "
        "ruined buildings silhouette, blood-red sky, cracked earth, "
        "distant destroyed city, atmospheric depth, "
        "horizontal game background no characters, " + BG_NEG,
    ]),

    ("bg_village", 1536, 512, 2560, 720, [
        QUALITY_PREFIX +
        "ruined village scrolling background, "
        "broken wooden structures, dead trees, grey sky, "
        "post-apocalyptic village destruction, "
        "horizontal game background no characters, " + BG_NEG,
    ]),
]

# Game-facing key → file name (for bosses/enemies that have per-state sprites)
MANIFEST_KEY = {
    "boss_spade_idle":   "spade_idle",
    "boss_spade_attack": "spade_attack",
    "boss_heart_idle":   "heart_idle",
    "boss_heart_attack": "heart_attack",
}

# ══════════════════════════════════════════════════════════════════
#  BACKEND: AUTO-DETECT  ComfyUI  or  Automatic1111
# ══════════════════════════════════════════════════════════════════

def probe(url, path, timeout=4):
    try:
        urllib.request.urlopen(f"{url}{path}", timeout=timeout)
        return True
    except Exception:
        return False

def detect_backend(force=None, comfy_port=8188):
    candidates = [
        ("comfyui", f"http://127.0.0.1:{comfy_port}", "/system_stats"),
        ("a1111",   "http://127.0.0.1:7860",           "/sdapi/v1/samplers"),
    ]
    if force:
        for name, url, path in candidates:
            if name == force:
                if probe(url, path):
                    return name, url
                else:
                    print(f"\n✗ {name} not reachable at {url}")
                    print_start_help(name, url)
                    sys.exit(1)
        print(f"Unknown backend: {force}")
        sys.exit(1)

    print("Scanning for a running image generator …")
    for name, url, path in candidates:
        print(f"  trying {name} at {url} … ", end="", flush=True)
        if probe(url, path):
            print("✓ FOUND")
            return name, url
        print("not running")

    # Nothing found
    print()
    comfy_url = candidates[0][1]   # already has the custom port baked in
    print("╔══════════════════════════════════════════════════════╗")
    print("║  Neither ComfyUI nor Automatic1111 is running.       ║")
    print("║                                                       ║")
    print("║  Start one of these first, then re-run this script:  ║")
    print("║                                                       ║")
    print("║  ▸ ComfyUI  (recommended):                           ║")
    print("║      cd ~/ComfyUI                                     ║")
    print("║      python main.py                                   ║")
    print(f"║      # then open {comfy_url:<36s}║")
    print("║                                                       ║")
    print("║  ▸ Automatic1111 / SD WebUI:                         ║")
    print("║      cd ~/stable-diffusion-webui                     ║")
    print("║      ./webui.sh  (Mac/Linux)                          ║")
    print("║      webui-user.bat  (Windows)                        ║")
    print("║      # then open http://127.0.0.1:7860               ║")
    print("║                                                       ║")
    print("║  Don't have either? Install guide:                   ║")
    print("║  ComfyUI  → https://github.com/comfyanonymous/ComfyUI ║")
    print("║  A1111    → https://github.com/AUTOMATIC1111/         ║")
    print("║             stable-diffusion-webui                    ║")
    print("╚══════════════════════════════════════════════════════╝")
    sys.exit(1)

def print_start_help(name, url):
    if name == "comfyui":
        print("  → Start ComfyUI:  cd ~/ComfyUI && python main.py")
        print(f"    then visit {url}")
    else:
        print("  → Start A1111:  cd ~/stable-diffusion-webui && ./webui.sh")
        print(f"    then visit {url}")

# ══════════════════════════════════════════════════════════════════
#  COMFYUI BACKEND
# ══════════════════════════════════════════════════════════════════

def comfy_get(url, path):
    with urllib.request.urlopen(f"{url}{path}", timeout=12) as r:
        return json.loads(r.read())

def comfy_post(url, path, data):
    payload = json.dumps(data).encode()
    req = urllib.request.Request(f"{url}{path}", data=payload,
                                  headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=12) as r:
        return json.loads(r.read())

def comfy_models(url):
    info = comfy_get(url, "/object_info/CheckpointLoaderSimple")
    return info["CheckpointLoaderSimple"]["input"]["required"]["ckpt_name"][0]

def comfy_loras(url):
    """Returns list of LoRA names available in ComfyUI."""
    try:
        info = comfy_get(url, "/object_info/LoraLoader")
        return info["LoraLoader"]["input"]["required"]["lora_name"][0]
    except Exception:
        return []

def comfy_generate(url, model, prompt, neg, w, h, seed, tag_name,
                   lora=None, lora_weight=0.8):
    w, h = (w//8)*8, (h//8)*8

    # ── Base workflow ──────────────────────────────────────────────
    wf = {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": model}},
        "2": {"class_type": "CLIPTextEncode",         "inputs": {"text": prompt, "clip": ["1",1]}},
        "3": {"class_type": "CLIPTextEncode",         "inputs": {"text": neg,    "clip": ["1",1]}},
        "4": {"class_type": "EmptyLatentImage",       "inputs": {"width": w, "height": h, "batch_size": 1}},
        "5": {"class_type": "KSampler", "inputs": {
                "model": ["1",0], "positive": ["2",0], "negative": ["3",0],
                "latent_image": ["4",0], "seed": seed, "steps": STEPS,
                "cfg": CFG, "sampler_name": "euler_ancestral",
                "scheduler": "karras", "denoise": 1.0}},
        "6": {"class_type": "VAEDecode",  "inputs": {"samples": ["5",0], "vae": ["1",2]}},
        "7": {"class_type": "SaveImage",  "inputs": {"images": ["6",0], "filename_prefix": tag_name}},
    }

    # ── Inject LoRA node if requested ──────────────────────────────
    # Node 8: LoraLoader  (model+clip flow: 1 → 8 → KSampler/CLIPTextEncode)
    if lora:
        wf["8"] = {"class_type": "LoraLoader", "inputs": {
            "model":           ["1", 0],
            "clip":            ["1", 1],
            "lora_name":       lora,
            "strength_model":  lora_weight,
            "strength_clip":   lora_weight,
        }}
        # Re-wire downstream nodes through the LoRA loader
        wf["2"]["inputs"]["clip"]   = ["8", 1]
        wf["3"]["inputs"]["clip"]   = ["8", 1]
        wf["5"]["inputs"]["model"]  = ["8", 0]

    pid = comfy_post(url, "/prompt", {"prompt": wf, "client_id": CLIENT_ID})["prompt_id"]
    # Poll until done
    deadline = time.time() + TIMEOUT
    while time.time() < deadline:
        try:
            hist = comfy_get(url, f"/history/{pid}")
            if pid in hist:
                for out in hist[pid].get("outputs", {}).values():
                    if out.get("images"):
                        img = out["images"][0]
                        qs  = urllib.parse.urlencode({
                            "filename": img["filename"],
                            "subfolder": img.get("subfolder",""),
                            "type": "output"})
                        return f"{url}/view?{qs}"  # URL to download
        except Exception:
            pass
        time.sleep(2)
    return None

# ══════════════════════════════════════════════════════════════════
#  AUTOMATIC1111 BACKEND
# ══════════════════════════════════════════════════════════════════

def a1111_get(url, path):
    with urllib.request.urlopen(f"{url}{path}", timeout=12) as r:
        return json.loads(r.read())

def a1111_post(url, path, data):
    payload = json.dumps(data).encode()
    req = urllib.request.Request(f"{url}{path}", data=payload,
                                  headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read())

def a1111_models(url):
    models = a1111_get(url, "/sdapi/v1/sd-models")
    return [m["title"] for m in models]

def a1111_loras(url):
    """Returns list of (alias, filename) tuples for available LoRAs."""
    try:
        loras = a1111_get(url, "/sdapi/v1/loras")
        return [(l.get("alias") or l["name"], l["name"]) for l in loras]
    except Exception:
        return []

def a1111_set_model(url, model_title):
    a1111_post(url, "/sdapi/v1/options", {"sd_model_checkpoint": model_title})

def a1111_generate(url, prompt, neg, w, h, seed, lora=None, lora_weight=0.8):
    """Returns raw PNG bytes.
    lora — alias/name string; injected as <lora:name:weight> in the prompt.
    """
    w, h = (w//8)*8, (h//8)*8
    # A1111 LoRA syntax: append <lora:alias:weight> to the positive prompt
    if lora:
        prompt = f"{prompt}, <lora:{lora}:{lora_weight:.2f}>"
    resp = a1111_post(url, "/sdapi/v1/txt2img", {
        "prompt":          prompt,
        "negative_prompt": neg,
        "width":           w,
        "height":          h,
        "steps":           STEPS,
        "cfg_scale":       CFG,
        "sampler_name":    "Euler a",
        "seed":            seed,
        "n_iter":          1,
        "batch_size":      1,
        "save_images":     False,
    })
    if not resp.get("images"):
        return None
    return base64.b64decode(resp["images"][0])

# ══════════════════════════════════════════════════════════════════
#  POST-PROCESS  — remove black background
# ══════════════════════════════════════════════════════════════════

def remove_black_bg(path, threshold=45):
    if not HAS_PIL:
        return
    try:
        img = Image.open(path).convert("RGBA")
        px  = img.load()
        w, h = img.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if (int(r)+int(g)+int(b)) / 3 < threshold:
                    px[x, y] = (r, g, b, 0)
        img.save(path, format="PNG", optimize=False)
    except Exception as e:
        print(f"    ⚠  Post-process failed: {e}")

# ══════════════════════════════════════════════════════════════════
#  SDXL DETECTION
# ══════════════════════════════════════════════════════════════════

def is_sdxl(name):
    n = name.lower()
    return any(x in n for x in ["xl", "sdxl", "pony", "flux"])

# ══════════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════════

def print_header():
    print()
    print("╔══════════════════════════════════════════════════════╗")
    print("║  北斗の拳  Sprite Generator  ·  Anime Edition        ║")
    print("╚══════════════════════════════════════════════════════╝")
    print()

def main():
    parser = argparse.ArgumentParser(
        description="Generate anime-style sprites via ComfyUI or Automatic1111")
    parser.add_argument("--regen", action="store_true",
        help="Delete ALL existing sprites and regenerate from scratch")
    parser.add_argument("--only", nargs="+", metavar="NAME",
        help="Only generate sprites whose name matches these keywords")
    parser.add_argument("--backend", choices=["comfyui","a1111"],
        help="Force a specific backend (default: auto-detect)")
    parser.add_argument("--port", type=int, default=8188, metavar="PORT",
        help="ComfyUI port (default: 8188). Ignored when --backend a1111 is used.")
    parser.add_argument("--lora", metavar="NAME",
        help="LoRA name/alias to apply (skip interactive prompt). "
             "Use '0' or 'none' to skip LoRA.")
    parser.add_argument("--lora-weight", type=float, default=0.8, metavar="W",
        help="LoRA strength (default: 0.8, range 0.0–1.5)")
    args = parser.parse_args()

    print_header()
    OUT.mkdir(parents=True, exist_ok=True)

    # ── --regen: delete existing sprites ──────────────────────────
    if args.regen:
        existing = list(OUT.glob("*.png"))
        if existing:
            print(f"⚠  --regen will DELETE {len(existing)} existing sprite(s).")
            if input("   Type YES to confirm: ").strip() != "YES":
                print("Aborted."); sys.exit(0)
            for f in existing:
                f.unlink()
            print(f"  ✓ Removed {len(existing)} old sprites.\n")

    # ── Detect backend ─────────────────────────────────────────────
    backend, base_url = detect_backend(args.backend, comfy_port=args.port)
    print(f"\n  Backend : {backend.upper()} at {base_url}\n")

    # ── List + pick model ──────────────────────────────────────────
    try:
        if backend == "comfyui":
            models = comfy_models(base_url)
        else:
            models = a1111_models(base_url)
    except Exception as e:
        print(f"✗ Could not list models: {e}"); sys.exit(1)

    if not models:
        print("✗ No models found."); sys.exit(1)

    print(f"Available models ({len(models)}):")
    for i, m in enumerate(models[:10]):
        print(f"  [{i:2d}] {m}")
    if len(models) > 10:
        print(f"       … and {len(models)-10} more")
    print()
    print("  Tip: for best anime results pick an anime checkpoint")
    print("       e.g. anything-v4, counterfeit, dreamshaper, abyssorangemix\n")

    choice = input(f"Select model [0–{len(models)-1}] (Enter = 0): ").strip()
    model  = models[int(choice)] if choice.isdigit() and int(choice) < len(models) else models[0]
    xl     = is_sdxl(model)
    print(f"\n  Model : {model}  ({'SDXL' if xl else 'SD1.5'})\n")

    # Switch model in A1111 if needed
    if backend == "a1111":
        print(f"  Loading model in A1111 … ", end="", flush=True)
        try:
            a1111_set_model(base_url, model)
            print("done\n")
        except Exception as e:
            print(f"warning: {e}\n")

    scale   = 2.0 if xl else 1.0
    MAX_DIM = 1536 if xl else 896

    # ── LoRA selection ─────────────────────────────────────────────
    sel_lora   = None   # final LoRA name/alias to use
    lora_weight = args.lora_weight

    if args.lora and args.lora.lower() not in ("0", "none", ""):
        # User supplied via CLI — use as-is
        sel_lora = args.lora
        print(f"  LoRA  : {sel_lora}  (weight {lora_weight})\n")

    elif args.lora is None:
        # Interactive — fetch list from backend
        print("Fetching LoRA list …")
        try:
            if backend == "comfyui":
                raw_loras = comfy_loras(base_url)
                lora_names = raw_loras          # list of strings
            else:
                raw_loras  = a1111_loras(base_url)
                lora_names = [alias for alias, _ in raw_loras]
        except Exception as e:
            raw_loras  = []
            lora_names = []
            print(f"  ⚠  Could not fetch LoRAs: {e}")

        if not lora_names:
            print("  (No LoRAs found — continuing without)\n")
        else:
            print(f"\nAvailable LoRAs ({len(lora_names)}):")
            print("  [ 0] (none — skip LoRA)")
            for i, name in enumerate(lora_names[:20], 1):
                print(f"  [{i:2d}] {name}")
            if len(lora_names) > 20:
                print(f"       … and {len(lora_names)-20} more")
            print()

            lora_choice = input(
                f"Select LoRA [0–{len(lora_names)}] (Enter = 0 / skip): ").strip()

            if lora_choice.isdigit():
                li = int(lora_choice)
                if 1 <= li <= len(lora_names):
                    sel_lora = lora_names[li - 1]
                    # Ask for weight
                    w_str = input(f"  LoRA weight [0.0–1.5] (Enter = {lora_weight}): ").strip()
                    if w_str:
                        try:
                            lora_weight = float(w_str)
                        except ValueError:
                            print("  Invalid weight — using default.")

    if sel_lora:
        print(f"\n  LoRA  : {sel_lora}  (weight {lora_weight:.2f})\n")
    else:
        print("  LoRA  : (none)\n")

    # ── Load existing manifest ─────────────────────────────────────
    manifest_path = OUT / "manifest.json"
    try:
        manifest = json.loads(manifest_path.read_text()).get("sprites", {})
    except Exception:
        manifest = {}

    # ── Filter sprites ─────────────────────────────────────────────
    def matches(name):
        return not args.only or any(k.lower() in name.lower() for k in args.only)

    todo  = [(n,gw,gh,dw,dh,fps) for n,gw,gh,dw,dh,fps in SPRITES if matches(n)]
    total_sprites = len(todo)
    total_frames  = sum(len(fps) for _,_,_,_,_,fps in todo)
    if total_sprites == 0:
        print("No sprites match the --only filter."); sys.exit(0)
    print(f"Sprites to generate: {total_sprites}  ({total_frames} frames total)\n")

    # ── Generate ───────────────────────────────────────────────────
    skipped = generated = failed = 0
    sprite_num = 0

    for name, gen_w, gen_h, disp_w, disp_h, frame_prompts in todo:
        sprite_num += 1
        game_key     = MANIFEST_KEY.get(name, name)
        neg          = BG_NEG if name.startswith("bg_") else NEG
        num_frames   = len(frame_prompts)
        frame_paths  = []   # collects paths for this sprite
        all_existed  = True

        for fidx, prompt in enumerate(frame_prompts):
            # File name: name_0.png, name_1.png, ... (single frame → name_0.png)
            fname  = f"{name}_{fidx}"
            dest   = OUT / f"{fname}.png"
            tag    = f"[{sprite_num:02d}/{total_sprites} f{fidx+1}/{num_frames}]"
            seed   = abs(hash(name + str(fidx) + model)) % (2**31)

            if dest.exists():
                print(f"{tag} SKIP  {fname}  (exists)")
                frame_paths.append(f"assets/sprites/{fname}.png")
                skipped += 1
                continue

            all_existed = False
            # Scale + cap dimensions
            ratio = min(MAX_DIM/(gen_w*scale), MAX_DIM/(gen_h*scale), 1.0)
            w = (int(gen_w*scale*ratio)//8)*8
            h = (int(gen_h*scale*ratio)//8)*8

            print(f"{tag} GEN   {fname}  ({w}×{h}) … ", end="", flush=True)
            try:
                if backend == "comfyui":
                    img_url = comfy_generate(base_url, model, prompt, neg, w, h, seed, fname,
                                             lora=sel_lora, lora_weight=lora_weight)
                    if img_url is None:
                        print("TIMEOUT"); failed += 1; frame_paths.append(None); continue
                    urllib.request.urlretrieve(img_url, str(dest))
                else:
                    png_bytes = a1111_generate(base_url, prompt, neg, w, h, seed,
                                               lora=sel_lora, lora_weight=lora_weight)
                    if png_bytes is None:
                        print("NO IMAGE RETURNED"); failed += 1; frame_paths.append(None); continue
                    dest.write_bytes(png_bytes)

                remove_black_bg(str(dest))
                kb = dest.stat().st_size // 1024
                print(f"✓  ({kb} KB)")
                frame_paths.append(f"assets/sprites/{fname}.png")
                generated += 1

            except Exception as e:
                print(f"ERROR: {e}"); failed += 1; frame_paths.append(None)

        # Write manifest entry for this sprite
        valid_paths = [p for p in frame_paths if p]
        if valid_paths:
            scaled_dw = round(disp_w * _SCALE)
            scaled_dh = round(disp_h * _SCALE)
            if num_frames == 1:
                # Single-frame: keep legacy path format for backgrounds
                manifest[game_key] = {"path": valid_paths[0], "dw": scaled_dw, "dh": scaled_dh}
            else:
                # Multi-frame animated sprite
                manifest[game_key] = {"frames": valid_paths, "dw": scaled_dw, "dh": scaled_dh}

    # ── Save manifest + sprites.js ────────────────────────────────
    data = {"generated": True, "sprites": manifest}
    manifest_path.write_text(json.dumps(data, indent=2))

    sprites_js_path = OUT / "sprites.js"
    sprites_js_path.write_text(
        "// Auto-generated by generate_sprites.py — do not edit\n"
        f"window.SPRITE_MANIFEST = {json.dumps(data, indent=2)};\n"
    )

    print()
    print("═" * 56)
    print(f"  Generated : {generated}")
    print(f"  Skipped   : {skipped}  (already existed)")
    print(f"  Failed    : {failed}")
    print(f"  Manifest  : {manifest_path}")
    print(f"  sprites.js: {sprites_js_path}")
    print("═" * 56)
    if generated + skipped > 0:
        print("\n✓ Refresh the game in your browser to see the sprites!")
    if failed:
        print(f"\n⚠  {failed} failed — re-run to retry them.")
    print()

if __name__ == "__main__":
    main()
