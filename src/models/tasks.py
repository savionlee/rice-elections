"""
Performs scheduled or heavy tasks that are not within the scope of a normal
web request.
"""

__author__ = 'Waseem Ahmad <waseem@rice.edu>'

import logging
import json
import webapp2
import models
import report_results

from datetime import datetime, timedelta
from google.appengine.api import mail, taskqueue


class ElectionResults(webapp2.RequestHandler):

    def get(self):
        finished_elections = models.Election.gql(
            "WHERE end < :1 AND result_computed = :2", datetime.now(), False)

        for election in finished_elections:
            self.compute_results(election)

    def compute_results(self, election):
        # Assert validity
        if not election:
            logging.error('Election not found.')
            return
        if election.end > datetime.now():
            logging.error('Election is still open.')
            return
        if election.result_computed:
            logging.error('Election results already computed.')
            return

        logging.info('Computing results for election: %s, organization: %s.', 
                        election.name, election.organization.name)

        total_ballot_count = 0
        for election_position in election.election_positions:
            total_ballot_count += election_position.ballots.count()
        if total_ballot_count > 2500:
            large_election = True
        else:
            large_election = False

        all_computed = True
        for election_position in election.election_positions:
            if not election_position.result_computed:
                all_computed = False

                if large_election:
                    # Enqueue a task for computing results
                    task_name = 'compute-result-' + str(election_position.key())
                    retry_options = taskqueue.TaskRetryOptions(task_retry_limit=0)
                    taskqueue.add(
                        name=task_name,
                        url='/tasks/position-results',
                        params={
                            'election_position_key': str(election_position.key())},
                        retry_options=retry_options
                    )
                else:
                    election_position.compute_winners()


        if all_computed:
            election.result_computed = True
            election.put()
            logging.info('Computed results for election: %s, organization: %s.',
                            election.name, election.organization.name)

            if not large_election:
                admin_emails = []
                for org_admin in election.organization.organization_admins:
                    admin_emails.append(org_admin.admin.email)
                report_results.email_report(admin_emails, election)

class PositionResults(webapp2.RequestHandler):

    def post(self):
        # Get data 
        elec_pos = models.ElectionPosition.get(
            self.request.get('election_position_key'))
        elec_pos.compute_winners()

        admin_emails = []
        for org_admin in elec_pos.election.organization.organization_admins:
            admin_emails.append(org_admin.admin.email)

        report_results.email_pos_report(admin_emails, elec_pos)




app = webapp2.WSGIApplication([
    ('/tasks/election-results', ElectionResults),
    ('/tasks/position-results', PositionResults)],
    debug=True)