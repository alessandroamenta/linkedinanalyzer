import { NextResponse } from 'next/server';
import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'linkedin-data-scraper.p.rapidapi.com';

export async function POST(request: Request) {
  try {
    const { profileUrl } = await request.json();

    const response = await axios.post(
      'https://linkedin-data-scraper.p.rapidapi.com/person',
      { link: profileUrl },
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
          'Content-Type': 'application/json'
        }
      }
    );

    const fullData = response.data;
    const data = fullData.data || {};

    const filteredData = {
      firstName: data.firstName,
      lastName: data.lastName,
      headline: data.headline,
      profilePicture: data.profilePic,
      backgroundPicture: data.backgroundPicture,
      location: data.addressWithCountry,
      summary: data.about,
      experience: data.experiences,
      education: data.educations
    };

    console.log(`Profile Picture URL: ${filteredData.profilePicture}`);
    console.log(`Background Picture URL: ${filteredData.backgroundPicture}`);

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while scraping the LinkedIn profile' }, { status: 500 });
  }
}