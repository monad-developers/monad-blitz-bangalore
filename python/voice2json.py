# voice2json.py
import sounddevice as sd
import scipy.io.wavfile
import tempfile
import speech_recognition as sr
import os
import json
from parser import parse_user_input

def record_voice(duration=5):
    import numpy as np

    fs = 44100  # Sampling rate
    recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float32')
    sd.wait()

    # Normalize the recording to [-1, 1] range
    recording = recording / np.max(np.abs(recording))
    
    # Convert to int16
    recording_int16 = np.int16(recording * 32767)

    # Create temp file with delete=False to ensure we can read it
    tmpfile = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    try:
        scipy.io.wavfile.write(tmpfile.name, fs, recording_int16)
        return tmpfile.name
    except Exception as e:
        if os.path.exists(tmpfile.name):
            os.remove(tmpfile.name)
        raise e

def transcribe_audio(filepath):
    recognizer = sr.Recognizer()
    
    # Adjust recognition settings
    recognizer.energy_threshold = 300
    recognizer.dynamic_energy_threshold = True
    
    with sr.AudioFile(filepath) as source:
        # Record audio from file
        audio = recognizer.record(source)
        try:
            # Use language parameter and handle errors
            return recognizer.recognize_google(audio, language='en-US')
        except sr.UnknownValueError:
            raise Exception("Could not understand audio")
        except sr.RequestError as e:
            raise Exception(f"Could not request results: {str(e)}")

def main():
    audio_file = None
    try:
        audio_file = record_voice()
        transcript = transcribe_audio(audio_file)
        
        # Parse the transcript using the same parser as text input
        parsed = parse_user_input(transcript)
        
        # Create response JSON with both transcript and parsed data
        response = {
            "transcript": transcript,
            "parsed": json.loads(parsed)  # Convert string to JSON object
        }
        
        # Print as JSON string
        print(json.dumps(response, ensure_ascii=False))
        
    except Exception as e:
        error_response = {
            "error": str(e),
            "details": "Voice processing failed"
        }
        print(json.dumps(error_response, ensure_ascii=False))
    finally:
        if audio_file and os.path.exists(audio_file):
            try:
                os.remove(audio_file)
            except:
                pass

if __name__ == "__main__":
    main()
