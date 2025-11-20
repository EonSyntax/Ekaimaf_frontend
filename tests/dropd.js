document.addEventListener('DOMContentLoaded', () => {
    const reports = [
        {
            year: '2025',
            summary: '3 Outreaches, 23 Trainings, 58 Scholarships, 237 Health care support and 18 Family Support and counting',
            stories: []
        },
        {
            year: '2024',
            summary: '3 Outreaches, 23 Trainings, 58 Scholarships, 237 Health care support and 18 Family Support',
            stories: [
                {
                    title: 'Ekaima Charitable Aid Foundation bean building a new house for a widow and her blind son.',
                    description: 'The house was completed, furnished and handed over in August 2025',
                    images: ['/assets/images/oldhouse.png', '/assets/images/newhouse.png']
                },
                {
                    title: 'Ekaima Charitable Aid Foundation Sharing wrappers, rice, tomatoes, cash, etc. to widows and vulnerable at Ikot Akpamba in Nsit Ubium LGA during Christmas 2024.',
                    description: '',
                    images: ['/assets/images/widow.jpg', '/assets/images/widow2.jpg']
                }
            ]
        },
        {
            year: '2023',
            summary: '3 Outreaches, 23 Trainings, 58 Scholarships, 237 Health care support and 18 Family Support',
            stories: []
        },
        {
            year: '2022',
            summary: '3 Outreaches, 23 Trainings, 58 Scholarships, 237 Health care support and 18 Family Support',
            stories: []
        }
    ];

    const accordion = document.getElementById('reportsAccordion');

    if (accordion) {
        for (const [index, report] of reports.entries()) {
            const item = document.createElement('div');
            item.className = 'accordion-item';

            const header = document.createElement('h2');
            header.className = 'accordion-header';
            header.id = `heading${report.year}`;

            const button = document.createElement('button');
            button.className = `accordion-button ${index === 1 ? '' : 'collapsed'}`;
            button.type = 'button';
            button.dataset.bsToggle = 'collapse';
            button.dataset.bsTarget = `#collapse${report.year}`;
            button.setAttribute('aria-expanded', `${index === 1}`);
            button.setAttribute('aria-controls', `collapse${report.year}`);
            button.innerHTML = `<span>${report.year}</span>`;

            header.appendChild(button);

            const collapse = document.createElement('div');
            collapse.id = `collapse${report.year}`;
            collapse.className = `accordion-collapse collapse ${index === 1 ? 'show' : ''}`;
            collapse.setAttribute('aria-labelledby', `heading${report.year}`);
            collapse.dataset.bsParent = '#reportsAccordion';

            const body = document.createElement('div');
            body.className = 'accordion-body';
            body.innerHTML = `<h5 class="report-summary">${report.summary}</h5>`;

            for (const story of report.stories) {
                const storyElement = document.createElement('div');
                storyElement.className = 'report-item mb-4';
                storyElement.innerHTML = `<p>${story.title}</p><p>${story.description}</p>`;

                if (story.images.length > 0) {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'report-images';
                    for (const image of story.images) {
                        const img = document.createElement('img');
                        img.src = image;
                        img.alt = story.title;
                        imageContainer.appendChild(img);
                    }
                    storyElement.appendChild(imageContainer);
                }

                body.appendChild(storyElement);
            }

            collapse.appendChild(body);
            item.appendChild(header);
            item.appendChild(collapse);
            accordion.appendChild(item);
        }
    }
});
