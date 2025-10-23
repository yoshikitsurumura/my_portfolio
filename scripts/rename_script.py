import os

def rename_file(old_path, new_path):
    try:
        os.rename(old_path, new_path)
        print(f"Renamed: {old_path} -> {new_path}")
    except FileNotFoundError:
        print(f"Error: File not found at {old_path}")
    except Exception as e:
        print(f"Error renaming {old_path}: {e}")

base_path = os.getcwd()

renames = [
    (os.path.join(base_path, 'images', 'CHATBOTLP', 'CHATBOTLP.mp4'), os.path.join(base_path, 'images', 'CHATBOTLP', 'voice-ai-chatbot-demo.mp4')),
    (os.path.join(base_path, 'images', 'webapp', 'webapp.mp4'), os.path.join(base_path, 'images', 'webapp', 'recruitment-management-system-demo.mp4')),
    (os.path.join(base_path, 'images', 'hero-video.mp4'), os.path.join(base_path, 'images', 'hero-video-1.mp4')),
    (os.path.join(base_path, 'images', 'hero-video2.mp4'), os.path.join(base_path, 'images', 'hero-video-2.mp4')),
    (os.path.join(base_path, 'images', 'ヘッダー.jpg'), os.path.join(base_path, 'images', 'header.jpg')),
    (os.path.join(base_path, 'images', 'automation', 'automation.mp4'), os.path.join(base_path, 'images', 'automation', 'business-automation-demo.mp4')),
    (os.path.join(base_path, 'images', 'automation', 'Discord _EigoChatBot.mp4'), os.path.join(base_path, 'images', 'automation', 'discord-eigo-chatbot.mp4')),
]

for old, new in renames:
    rename_file(old, new)