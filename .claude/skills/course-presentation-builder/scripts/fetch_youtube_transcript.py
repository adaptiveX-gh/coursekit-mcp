#!/usr/bin/env python3
"""
Fetch transcript from YouTube video.

This script downloads the transcript (captions/subtitles) from a YouTube
video and formats it for analysis.

Usage:
    python fetch_youtube_transcript.py <youtube_url> [--output transcript.txt]
    python fetch_youtube_transcript.py https://youtube.com/watch?v=abc123

Requirements:
    pip install youtube-transcript-api
"""

import argparse
import re
from pathlib import Path
from typing import List, Dict, Optional

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import (
        TranscriptsDisabled,
        NoTranscriptFound,
        VideoUnavailable
    )
except ImportError:
    print("Error: youtube-transcript-api not installed")
    print("Install with: pip install youtube-transcript-api")
    exit(1)


class YouTubeTranscriptFetcher:
    """Fetch and format YouTube video transcripts."""

    def __init__(self, url: str):
        self.url = url
        self.video_id = self._extract_video_id(url)

        if not self.video_id:
            raise ValueError(f"Could not extract video ID from URL: {url}")

    def _extract_video_id(self, url: str) -> Optional[str]:
        """
        Extract video ID from various YouTube URL formats.

        Supports:
        - https://youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        - https://www.youtube.com/v/VIDEO_ID
        """
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/v/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com/watch\?.*v=([a-zA-Z0-9_-]{11})',
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        return None

    def fetch_transcript(self, languages: List[str] = None) -> List[Dict]:
        """
        Fetch transcript from YouTube.

        Args:
            languages: List of language codes to try (default: ['en'])

        Returns:
            List of transcript segments with text, start time, and duration
        """
        if languages is None:
            languages = ['en']

        print(f"Fetching transcript for video ID: {self.video_id}")

        try:
            # Try to get transcript in preferred languages
            transcript = YouTubeTranscriptApi.get_transcript(
                self.video_id,
                languages=languages
            )

            print(f"✓ Found transcript with {len(transcript)} segments")
            return transcript

        except TranscriptsDisabled:
            raise ValueError(
                "Transcripts are disabled for this video. "
                "Try a different video or enable captions."
            )
        except NoTranscriptFound:
            # Try to list available transcripts
            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(self.video_id)
                available = [t.language_code for t in transcript_list]
                raise ValueError(
                    f"No transcript found in requested languages: {languages}. "
                    f"Available languages: {available}"
                )
            except Exception:
                raise ValueError(
                    "No transcript found for this video. "
                    "Make sure the video has captions enabled."
                )
        except VideoUnavailable:
            raise ValueError(
                f"Video unavailable or does not exist: {self.video_id}"
            )
        except Exception as e:
            raise ValueError(f"Error fetching transcript: {e}")

    def format_transcript(
        self,
        transcript: List[Dict],
        include_timestamps: bool = True,
        timestamp_interval: int = 60
    ) -> str:
        """
        Format transcript for readability.

        Args:
            transcript: Raw transcript data from API
            include_timestamps: Whether to include timestamps
            timestamp_interval: Show timestamps every N seconds (default: 60)

        Returns:
            Formatted transcript text
        """
        print("Formatting transcript...")

        output_lines = []
        current_paragraph = []
        last_timestamp_shown = -timestamp_interval

        for segment in transcript:
            text = segment['text'].strip()
            start_time = segment['start']

            # Show timestamp periodically
            if include_timestamps and (start_time - last_timestamp_shown) >= timestamp_interval:
                if current_paragraph:
                    # Finish current paragraph
                    output_lines.append(' '.join(current_paragraph))
                    output_lines.append('')
                    current_paragraph = []

                # Add timestamp
                timestamp = self._format_time(start_time)
                output_lines.append(f"[{timestamp}]")
                last_timestamp_shown = start_time

            # Add text to current paragraph
            current_paragraph.append(text)

            # Break paragraph at sentence endings
            if text.endswith(('.', '!', '?')) and len(' '.join(current_paragraph)) > 200:
                output_lines.append(' '.join(current_paragraph))
                output_lines.append('')
                current_paragraph = []

        # Add remaining text
        if current_paragraph:
            output_lines.append(' '.join(current_paragraph))

        formatted = '\n'.join(output_lines)

        print(f"✓ Formatted transcript: {len(formatted)} characters")
        return formatted

    def _format_time(self, seconds: float) -> str:
        """Format seconds as MM:SS or HH:MM:SS."""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)

        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        else:
            return f"{minutes:02d}:{secs:02d}"

    def get_formatted_transcript(
        self,
        languages: List[str] = None,
        include_timestamps: bool = True,
        timestamp_interval: int = 60
    ) -> str:
        """
        Fetch and format transcript in one step.

        Args:
            languages: List of language codes to try
            include_timestamps: Whether to include timestamps
            timestamp_interval: Show timestamps every N seconds

        Returns:
            Formatted transcript text
        """
        transcript = self.fetch_transcript(languages)
        return self.format_transcript(
            transcript,
            include_timestamps=include_timestamps,
            timestamp_interval=timestamp_interval
        )


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Fetch and format YouTube video transcript',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python fetch_youtube_transcript.py "https://youtube.com/watch?v=abc123"
  python fetch_youtube_transcript.py "https://youtu.be/abc123" -o transcript.txt
  python fetch_youtube_transcript.py "VIDEO_ID" --no-timestamps
  python fetch_youtube_transcript.py "VIDEO_ID" --languages en es fr
        """
    )
    parser.add_argument(
        'url',
        help='YouTube URL or video ID'
    )
    parser.add_argument(
        '--output', '-o',
        default='raw_transcript.txt',
        help='Output text file path (default: raw_transcript.txt)'
    )
    parser.add_argument(
        '--languages', '-l',
        nargs='+',
        default=['en'],
        help='Language codes to try (default: en)'
    )
    parser.add_argument(
        '--no-timestamps',
        action='store_true',
        help='Exclude timestamps from output'
    )
    parser.add_argument(
        '--timestamp-interval',
        type=int,
        default=60,
        help='Show timestamps every N seconds (default: 60)'
    )

    args = parser.parse_args()

    try:
        # Create fetcher
        fetcher = YouTubeTranscriptFetcher(args.url)

        # Get formatted transcript
        transcript_text = fetcher.get_formatted_transcript(
            languages=args.languages,
            include_timestamps=not args.no_timestamps,
            timestamp_interval=args.timestamp_interval
        )

        # Save to file
        output_path = Path(args.output)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"# Transcript for: {args.url}\n")
            f.write(f"# Video ID: {fetcher.video_id}\n")
            f.write(f"# Languages: {', '.join(args.languages)}\n\n")
            f.write(transcript_text)

        print(f"\n✓ Success! Transcript saved to: {output_path}")

        # Show preview
        preview = transcript_text[:500]
        print(f"\nPreview:\n{preview}...")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        exit(1)


if __name__ == '__main__':
    main()
