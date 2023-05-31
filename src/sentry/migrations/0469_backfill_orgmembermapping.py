# Generated by Django 2.2.28 on 2023-05-12 19:45

from django.db import IntegrityError, migrations

from sentry.new_migrations.migrations import CheckedMigration
from sentry.utils.query import RangeQuerySetWrapperWithProgressBar


def backfill_org_membermapping(apps, schema_editor):
    OrganizationMember = apps.get_model("sentry", "OrganizationMember")
    OrganizationMemberMapping = apps.get_model("sentry", "OrganizationMemberMapping")

    # Remove member mappings that lack organizationmember_id as they are old records that
    # predate the addition of organizationmember_id. We need organizationmember_id to be
    # set in order to start reading from the membermapping table.
    OrganizationMemberMapping.objects.filter(organizationmember_id__isnull=True).delete()

    for member in RangeQuerySetWrapperWithProgressBar(OrganizationMember.objects.all()):
        mapping = OrganizationMemberMapping.objects.filter(
            organization_id=member.organization_id, organizationmember_id=member.id
        ).first()
        # Record already exists, we assume it is synced.
        if mapping:
            continue

        try:
            OrganizationMemberMapping.objects.create(
                organization_id=member.organization_id,
                organizationmember_id=member.id,
                role=member.role,
                user_id=member.user_id,
                email=member.email,
                inviter_id=member.inviter_id,
                invite_status=member.invite_status,
            )
        except IntegrityError:
            # Conflicts are ok.
            pass


class Migration(CheckedMigration):
    # This flag is used to mark that a migration shouldn't be automatically run in production. For
    # the most part, this should only be used for operations where it's safe to run the migration
    # after your code has deployed. So this should not be used for most operations that alter the
    # schema of a table.
    # Here are some things that make sense to mark as dangerous:
    # - Large data migrations. Typically we want these to be run manually by ops so that they can
    #   be monitored and not block the deploy for a long period of time while they run.
    # - Adding indexes to large tables. Since this can take a long time, we'd generally prefer to
    #   have ops run this and not block the deploy. Note that while adding an index is a schema
    #   change, it's completely safe to run the operation after the code has deployed.
    is_dangerous = True

    dependencies = [
        ("sentry", "0468_pickle_to_json_sentry_rawevent"),
    ]

    operations = [
        migrations.RunPython(
            backfill_org_membermapping,
            reverse_code=migrations.RunPython.noop,
            hints={"tables": ["sentry_organizationmembermapping", "sentry_organizationmember"]},
        )
    ]
