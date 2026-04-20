const fs = require('fs');
let content = fs.readFileSync('src/pages/index.html', 'utf8');

const htmlToAdd = `
      <div style="text-align: center; margin-top: 40px;" class="reveal">
        <button class="btn btn-primary" style="padding: 12px 28px;" onclick="document.getElementById('review-modal').style.display='flex'">
          &#9998; Add Your Review
        </button>
      </div>
      
      <!-- Review Modal -->
      <div id="review-modal" class="modal-backdrop" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
        <div class="modal-content" style="background:var(--bg-card); padding:30px; border-radius:var(--radius-lg); width:90%; max-width:500px; box-shadow:0 10px 30px rgba(0,0,0,0.1); position:relative;">
          <button style="position:absolute; top:20px; right:20px; background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-mid)" onclick="document.getElementById('review-modal').style.display='none'">&times;</button>
          <h3 style="margin-bottom:20px; font-size:1.5rem">Share Your Experience</h3>
          <form id="review-form" onsubmit="submitReview(event)">
            <div style="margin-bottom:15px">
              <label style="display:block; margin-bottom:5px; font-weight:500; font-size:0.9rem">Your Name</label>
              <input type="text" id="rev-name" required placeholder="Ex: Amanda Perera" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:8px; background:var(--bg-light); color:var(--text-dark)">
            </div>
            <div style="margin-bottom:15px">
              <label style="display:block; margin-bottom:5px; font-weight:500; font-size:0.9rem">Role / Location</label>
              <input type="text" id="rev-role" required placeholder="Ex: Patient, Colombo" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:8px; background:var(--bg-light); color:var(--text-dark)">
            </div>
            <div style="margin-bottom:15px">
              <label style="display:block; margin-bottom:5px; font-weight:500; font-size:0.9rem">Rating</label>
              <select id="rev-rating" style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:8px; background:var(--bg-light); color:var(--text-dark)">
                <option value="5">&#9733;&#9733;&#9733;&#9733;&#9733; (5/5 Stars)</option>
                <option value="4">&#9733;&#9733;&#9733;&#9733;&#9734; (4/5 Stars)</option>
                <option value="3">&#9733;&#9733;&#9733;&#9734;&#9734; (3/5 Stars)</option>
                <option value="2">&#9733;&#9733;&#9734;&#9734;&#9734; (2/5 Stars)</option>
                <option value="1">&#9733;&#9734;&#9734;&#9734;&#9734; (1/5 Star)</option>
              </select>
            </div>
            <div style="margin-bottom:20px">
              <label style="display:block; margin-bottom:5px; font-weight:500; font-size:0.9rem">Your Honest Review</label>
              <textarea id="rev-text" required rows="4" placeholder="Tell us how PCOS Care Hub helped you..." style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:8px; background:var(--bg-light); color:var(--text-dark); resize:vertical"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%">Submit Review</button>
          </form>
        </div>
      </div>
      
      <script>
      async function submitReview(e) {
          e.preventDefault();
          const name = document.getElementById('rev-name').value;
          const role = document.getElementById('rev-role').value;
          const rating = document.getElementById('rev-rating').value;
          const text = document.getElementById('rev-text').value;

          const formData = new FormData();
          formData.append('name', name);
          formData.append('role_location', role);
          formData.append('rating', rating);
          formData.append('review_text', text);

          try {
              const res = await fetch('../php/submit_review.php', {
                  method: 'POST',
                  body: formData
              });
              const data = await res.json();
              if (data.status === 'success') {
                  if (typeof Toast !== 'undefined') Toast.success('Thank you for your review!');
                  else alert('Thank you for your review!');
                  document.getElementById('review-form').reset();
                  document.getElementById('review-modal').style.display='none';
              } else {
                  if (typeof Toast !== 'undefined') Toast.error(data.message);
                  else alert(data.message);
              }
          } catch(err) {
              console.error(err);
              if (typeof Toast !== 'undefined') Toast.error('Failed to submit review.');
          }
      }
      </script>
`;

let idx = content.indexOf('<section class="cta-section"');
if (idx !== -1) {
    let chunk1 = content.substring(0, idx);
    let chunk2 = content.substring(idx);
    
    // Find the end of the section just before cta-section
    let lastDivIdx = chunk1.lastIndexOf('</section>');
    if (lastDivIdx !== -1) {
        chunk1 = chunk1.substring(0, lastDivIdx) + htmlToAdd + '\n    </section>\n\n    ';
        fs.writeFileSync('src/pages/index.html', chunk1 + chunk2, 'utf8');
        console.log('Successfully injected Add Review button and Modal.');
    }
} else {
    console.log('Error: Could not find cta-section marker.');
}
