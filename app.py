from flask import (
    Flask,
    render_template,
    request,
    send_file,
    jsonify,
    flash, 
    redirect, 
    url_for,
    session
)
import resend
import os
import hmac
import secrets
from datetime import datetime
from urllib.parse import urlsplit
import zipfile
from markupsafe import escape
from docx import Document
from io import BytesIO
from docx.shared import Pt
from deep_translator import GoogleTranslator
from supabase import create_client
from generators.unscramble import UnscrambleSection
from generators.fill_blank import FillBlankSection
from generators.translate import TranslationSection
from generators.word_search import WordSearchSection

app = Flask(__name__)

app.secret_key = os.environ.get("FLASK_SECRET_KEY") or os.urandom(32)

resend.api_key = os.environ.get("RESEND_API_KEY")

superbase_url = os.environ.get("SUPABASE_URL")
superbase_key = os.environ.get("SUPABASE_KEY")

# supabase = create_client(supabase_url=superbase_url, supabase_key=superbase_key)

@app.context_processor
def inject_current_year():
    return {
        "current_year": datetime.now().year
    }


def create_auth_client():
    return create_client(
        supabase_url=superbase_url,
        supabase_key=superbase_key
    )


def create_profile_client():
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not service_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not configured")
    return create_client(
        supabase_url=superbase_url,
        supabase_key=service_key
    )


def is_safe_redirect_target(target):
    parsed_target = urlsplit(target)
    return (
        target.startswith("/")
        and not target.startswith("//")
        and not parsed_target.scheme
        and not parsed_target.netloc
        and "\\" not in target
    )


def set_logged_in_user(user):
    metadata = getattr(user, "user_metadata", None) or {}
    logged_in_user = {
        "id": user.id,
        "email": user.email,
        "display_name": metadata.get("display_name") or user.email,
        "avatar_url": metadata.get("avatar_url") or ""
    }

    try:
        profile_rows = (
            create_profile_client().table("profiles")
            .select("display_name,avatar_url")
            .eq("id", user.id)
            .limit(1)
            .execute()
            .data
        )
        if profile_rows:
            logged_in_user["display_name"] = (
                profile_rows[0].get("display_name")
                or logged_in_user["display_name"]
            )
            logged_in_user["avatar_url"] = profile_rows[0].get("avatar_url") or ""
    except Exception as error:
        app.logger.info("Could not load profile image during login: %s", error)

    session["user"] = logged_in_user


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/games")
def games():
    return render_template("games.html")

@app.route("/faq")
def faq():
    return render_template("faq.html")

@app.route("/sign-up", methods=["GET", "POST"])
def sign_up():
    if request.method == "POST":
        display_name = request.form.get("display_name", "").strip()
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if not display_name or not username or not email or not password:
            flash("Please complete all required fields.", "danger")
            return redirect(url_for("sign_up"))

        if len(display_name) > 100 or len(username) > 50 or len(email) > 254:
            flash("One or more fields exceed the allowed length.", "danger")
            return redirect(url_for("sign_up"))

        if password != confirm_password:
            flash("The passwords do not match.", "danger")
            return redirect(url_for("sign_up"))

        try:
            response = create_auth_client().auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "email_redirect_to": url_for(
                        "email_confirmation",
                        _external=True
                    ),
                    "data": {
                        "display_name": display_name,
                        "username": username
                    }
                }
            })

            if response.session:
                set_logged_in_user(response.user)
                flash("Your account has been created.", "success")
                return redirect(url_for("index"))

            flash(
                "Your account was created. Check your email to confirm it, then log in.",
                "success"
            )
            return redirect(url_for("login"))
        except Exception as error:
            app.logger.warning("Supabase sign-up failed: %s", error)
            flash(
                "We could not create your account. Check your details and try again.",
                "danger"
            )
            return redirect(url_for("sign_up"))

    return render_template("sign_up.html")


@app.route("/email-confirmation")
def email_confirmation():
    confirmation_failed = any(
        request.args.get(parameter)
        for parameter in ("error", "error_code", "error_description")
    )
    return render_template(
        "components/emailConfirmationPage.html",
        confirmation_failed=confirmation_failed
    )


@app.route("/login", methods=["GET", "POST"])
def login():
    next_url = request.values.get("next", "")

    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")

        if not email or not password:
            flash("Enter your email address and password.", "danger")
            return redirect(url_for("login", next=next_url) if next_url else url_for("login"))

        try:
            response = create_auth_client().auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            set_logged_in_user(response.user)
            flash("You are now logged in.", "success")
            if is_safe_redirect_target(next_url):
                return redirect(next_url)
            return redirect(url_for("index"))
        except Exception as error:
            app.logger.warning("Supabase login failed: %s", error)
            flash("Login failed. Check your email and password.", "danger")
            return redirect(url_for("login", next=next_url) if next_url else url_for("login"))

    return render_template("login_page.html", next_url=next_url)


@app.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        if not email or len(email) > 254:
            flash("Enter a valid email address.", "danger")
            return redirect(url_for("forgot_password"))

        try:
            create_auth_client().auth.reset_password_for_email(
                email,
                options={
                    "redirect_to": url_for("reset_password", _external=True)
                }
            )
        except Exception as error:
            app.logger.warning("Supabase recovery email request failed: %s", error)

        flash(
            "If an account exists for that email, a password reset link will arrive shortly.",
            "success"
        )
        return redirect(url_for("forgot_password"))

    return render_template("forgot_password.html")


@app.route("/reset-password")
def reset_password():
    return render_template(
        "reset_password.html",
        supabase_url=superbase_url,
        supabase_key=superbase_key
    )


@app.route("/api/reset-password", methods=["POST"])
def api_reset_password():
    payload = request.get_json(silent=True) or {}
    access_token = payload.get("access_token", "")
    refresh_token = payload.get("refresh_token", "")
    password = payload.get("password", "")
    confirm_password = payload.get("confirm_password", "")

    if not access_token or not refresh_token:
        return jsonify({"error": "This reset link is invalid or expired. Request a new one."}), 400
    if not isinstance(password, str) or len(password) < 8:
        return jsonify({"error": "Your new password must be at least 8 characters."}), 400
    if password != confirm_password:
        return jsonify({"error": "The passwords do not match."}), 400

    try:
        auth_client = create_auth_client()
        auth_client.auth.set_session(access_token, refresh_token)
        auth_client.auth.update_user({"password": password})
        return jsonify({"success": True})
    except Exception as error:
        app.logger.warning("Supabase password reset failed: %s", error)
        return jsonify({"error": "This reset link is invalid or expired. Request a new one."}), 400


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    flash("You are now logged out.", "success")
    return redirect(url_for("index"))

@app.route("/profile", methods=["GET", "POST"])
def profile():
    logged_in_user = session.get("user")
    if not logged_in_user:
        flash("Please log in to view your profile.", "warning")
        return redirect(url_for("login"))

    user_id = logged_in_user["id"]
    profile_data = {
        "email": logged_in_user.get("email", ""),
        "display_name": logged_in_user.get("display_name", ""),
        "username": "",
        "avatar_url": "",
        "bio": "",
        "country": ""
    }
    teacher_data = {
        "subjects": [],
        "grade_levels": [],
        "years_experience": "",
        "school_name": "",
        "school_name_is_public": False,
        "specializations": []
    }
    worksheets = []
    lessons = []

    try:
        profile_client = create_profile_client()

        if request.method == "POST":
            display_name = request.form.get("display_name", "").strip()
            username = request.form.get("username", "").strip()
            bio = request.form.get("bio", "").strip()
            country = request.form.get("country", "").strip()
            school_name = request.form.get("school_name", "").strip()
            school_name_is_public = request.form.get("school_name_is_public") == "on"
            subjects = request.form.getlist("subjects")
            grade_levels = request.form.getlist("grade_levels")
            specializations = [
                item.strip()
                for item in request.form.get("specializations", "").split(",")
                if item.strip()
            ][:12]
            years_experience_value = request.form.get("years_experience", "").strip()

            if not display_name or not username:
                raise ValueError("Display name and username are required.")
            if len(display_name) > 100 or len(username) > 50:
                raise ValueError("Display name or username is too long.")
            if len(country) > 100 or len(school_name) > 150:
                raise ValueError("Country or school name is too long.")

            years_experience = None
            if years_experience_value:
                years_experience = int(years_experience_value)
                if not 0 <= years_experience <= 80:
                    raise ValueError("Years of experience must be between 0 and 80.")

            allowed_subjects = {
                "English language", "Mathematics", "Science", "Social studies",
                "Art", "Music", "Physical education", "Computer science",
                "Other"
            }
            allowed_grade_levels = {
                "Early childhood", "Elementary", "Middle school", "High school",
                "Adult education", "Other"
            }
            subjects = [item for item in subjects if item in allowed_subjects]
            grade_levels = [item for item in grade_levels if item in allowed_grade_levels]

            current_profile_rows = (
                profile_client.table("profiles")
                .select("avatar_url")
                .eq("id", user_id)
                .limit(1)
                .execute()
                .data
            )
            avatar_url = current_profile_rows[0].get("avatar_url", "") if current_profile_rows else ""
            avatar_file = request.files.get("profile_picture")

            if avatar_file and avatar_file.filename:
                avatar_bytes = avatar_file.stream.read(5 * 1024 * 1024 + 1)
                if len(avatar_bytes) > 5 * 1024 * 1024:
                    raise ValueError("Profile pictures must be 5 MB or smaller.")

                if avatar_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
                    content_type, extension = "image/png", "png"
                elif avatar_bytes.startswith(b"\xff\xd8\xff"):
                    content_type, extension = "image/jpeg", "jpg"
                elif avatar_bytes[:4] == b"RIFF" and avatar_bytes[8:12] == b"WEBP":
                    content_type, extension = "image/webp", "webp"
                else:
                    raise ValueError("Choose a PNG, JPG, or WebP image.")

                avatar_path = f"{user_id}/avatar.{extension}"
                profile_client.storage.from_("profile-avatars").upload(
                    path=avatar_path,
                    file=avatar_bytes,
                    file_options={"content-type": content_type, "upsert": "true"}
                )
                avatar_url = profile_client.storage.from_("profile-avatars").get_public_url(
                    avatar_path
                )

            profile_client.table("profiles").upsert({
                "id": user_id,
                "email": logged_in_user.get("email", ""),
                "display_name": display_name,
                "username": username,
                "avatar_url": avatar_url,
                "bio": bio,
                "country": country
            }, on_conflict="id").execute()

            profile_client.table("teacher_profiles").upsert({
                "user_id": user_id,
                "subjects": subjects,
                "grade_levels": grade_levels,
                "years_experience": years_experience,
                "school_name": school_name or None,
                "school_name_is_public": school_name_is_public,
                "specializations": specializations
            }, on_conflict="user_id").execute()

            logged_in_user["display_name"] = display_name
            logged_in_user["avatar_url"] = avatar_url
            session["user"] = logged_in_user
            flash("Your profile has been saved.", "success")
            return redirect(url_for("profile"))

        profile_rows = (
            profile_client.table("profiles")
            .select("email,display_name,username,avatar_url,bio,country")
            .eq("id", user_id)
            .limit(1)
            .execute()
            .data
        )
        if profile_rows:
            profile_data.update(profile_rows[0])
            logged_in_user["display_name"] = (
                profile_data.get("display_name") or logged_in_user["display_name"]
            )
            logged_in_user["avatar_url"] = profile_data.get("avatar_url") or ""
            session["user"] = logged_in_user

        teacher_rows = (
            profile_client.table("teacher_profiles")
            .select("subjects,grade_levels,years_experience,school_name,school_name_is_public,specializations")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
            .data
        )
        if teacher_rows:
            teacher_data.update(teacher_rows[0])

        worksheets = (
            profile_client.table("worksheets")
            .select("id,title,subject,grade_level,created_at")
            .eq("user_id", user_id)
            .eq("is_public", True)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
            .data
        )
        lessons = (
            profile_client.table("lessons")
            .select("id,title,subject,grade_level,created_at")
            .eq("user_id", user_id)
            .eq("is_public", True)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
            .data
        )
    except ValueError as error:
        flash(str(error), "danger")
    except Exception as error:
        app.logger.warning("Profile operation failed: %s", error)
        flash(
            "We could not load or save your profile. Check the profile database setup and try again.",
            "danger"
        )

    return render_template(
        "profile.html",
        profile=profile_data,
        teacher=teacher_data,
        worksheets=worksheets,
        lessons=lessons,
        subject_options=[
            "English language", "Mathematics", "Science", "Social studies",
            "Art", "Music", "Physical education", "Computer science", "Other"
        ],
        grade_options=[
            "Early childhood", "Elementary", "Middle school", "High school",
            "Adult education", "Other"
        ]
    )


@app.route("/settings", methods=["GET", "POST"])
def settings():
    logged_in_user = session.get("user")
    if not logged_in_user:
        flash("Please log in to manage your settings.", "warning")
        return redirect(url_for("login"))

    user_id = logged_in_user["id"]
    account = {
        "email": logged_in_user.get("email", ""),
        "display_name": logged_in_user.get("display_name", ""),
        "username": "",
        "avatar_url": logged_in_user.get("avatar_url", ""),
        "bio": "",
        "is_public": False,
        "subjects": [],
        "grade_levels": [],
        "years_experience": None,
        "specializations": []
    }
    preferences = {
        "preferred_language": "en",
        "theme": "system",
        "email_notifications": True,
        "community_notifications": True
    }
    subscription = None

    if request.method == "POST":
        expected_token = session.get("_settings_csrf_token", "")
        provided_token = request.form.get("csrf_token", "")
        if not expected_token or not hmac.compare_digest(expected_token, provided_token):
            flash("Your settings form expired. Please try again.", "warning")
            return redirect(url_for("settings"))

        action = request.form.get("action", "")
        try:
            if action == "preferences":
                language = request.form.get("preferred_language", "en")
                theme = request.form.get("theme", "system")
                if language not in {"en", "ko", "es", "ja", "zh"}:
                    raise ValueError("Choose a supported language.")
                if theme not in {"light", "dark", "system"}:
                    raise ValueError("Choose a supported theme.")

                preferences.update({
                    "preferred_language": language,
                    "theme": theme,
                    "email_notifications": request.form.get("email_notifications") == "on",
                    "community_notifications": request.form.get("community_notifications") == "on"
                })
                create_profile_client().table("user_preferences").upsert({
                    "user_id": user_id,
                    **preferences
                }, on_conflict="user_id").execute()
                session["theme"] = theme
                flash("Your preferences have been saved.", "success")

            elif action == "public_profile":
                is_public = request.form.get("is_public") == "on"
                create_profile_client().table("profiles").update({
                    "is_public": is_public
                }).eq("id", user_id).execute()
                account["is_public"] = is_public
                flash("Your profile visibility has been updated.", "success")

            elif action in {"update_email", "update_password", "delete_account"}:
                current_password = request.form.get("current_password", "")
                if not current_password:
                    raise ValueError("Enter your current password to continue.")

                auth_client = create_auth_client()
                verified_user = auth_client.auth.sign_in_with_password({
                    "email": logged_in_user["email"],
                    "password": current_password
                }).user
                if verified_user.id != user_id:
                    raise ValueError("Your account could not be verified.")

                if action == "update_email":
                    new_email = request.form.get("new_email", "").strip()
                    if not new_email or len(new_email) > 254:
                        raise ValueError("Enter a valid email address.")
                    auth_client.auth.update_user({"email": new_email})
                    flash(
                        "Check your inbox to confirm the email address change.",
                        "success"
                    )
                elif action == "update_password":
                    new_password = request.form.get("new_password", "")
                    confirm_password = request.form.get("confirm_password", "")
                    if len(new_password) < 8:
                        raise ValueError("Your new password must be at least 8 characters.")
                    if new_password != confirm_password:
                        raise ValueError("The new passwords do not match.")
                    auth_client.auth.update_user({"password": new_password})
                    flash("Your password has been updated.", "success")
                else:
                    if request.form.get("delete_confirmation", "") != "DELETE":
                        raise ValueError('Type "DELETE" to confirm account removal.')
                    create_profile_client().auth.admin.delete_user(user_id)
                    session.clear()
                    flash("Your account has been deleted.", "success")
                    return redirect(url_for("index"))

            else:
                raise ValueError("Unknown settings action.")

            return redirect(url_for("settings"))
        except ValueError as error:
            flash(str(error), "danger")
        except Exception as error:
            app.logger.warning("Account settings action failed: %s", error)
            flash(
                "We could not complete that settings change. Check your details and try again.",
                "danger"
            )

    try:
        profile_client = create_profile_client()
        profile_rows = (
            profile_client.table("profiles")
            .select("email,display_name,username,avatar_url,bio,is_public")
            .eq("id", user_id)
            .limit(1)
            .execute()
            .data
        )
        if profile_rows:
            account.update(profile_rows[0])

        teacher_rows = (
            profile_client.table("teacher_profiles")
            .select("subjects,grade_levels,years_experience,specializations")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
            .data
        )
        if teacher_rows:
            account.update(teacher_rows[0])

        preference_rows = (
            profile_client.table("user_preferences")
            .select("preferred_language,theme,email_notifications,community_notifications")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
            .data
        )
        if preference_rows:
            preferences.update(preference_rows[0])
        session["theme"] = preferences["theme"]

        subscription_rows = (
            profile_client.table("subscriptions")
            .select("status,started_at,expires_at,plan_id")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
            .data
        )
        if subscription_rows:
            subscription = subscription_rows[0]
            plan_rows = (
                profile_client.table("plans")
                .select("name,description,price,currency,billing_interval")
                .eq("id", subscription["plan_id"])
                .limit(1)
                .execute()
                .data
            )
            subscription["plan"] = plan_rows[0] if plan_rows else None
        else:
            free_plan_rows = (
                profile_client.table("plans")
                .select("name,description,price,currency,billing_interval")
                .eq("name", "Free")
                .limit(1)
                .execute()
                .data
            )
            if free_plan_rows:
                subscription = {
                    "status": "active",
                    "plan": free_plan_rows[0]
                }
    except Exception as error:
        app.logger.warning("Settings data could not be loaded: %s", error)
        flash("Some settings could not be loaded. Please try again later.", "warning")

    csrf_token = session.get("_settings_csrf_token")
    if not csrf_token:
        csrf_token = secrets.token_urlsafe(32)
        session["_settings_csrf_token"] = csrf_token

    return render_template(
        "settings.html",
        account=account,
        preferences=preferences,
        subscription=subscription,
        csrf_token=csrf_token
    )


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":

        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")
        reason = request.form.get("reason", "").strip()
        game = request.form.get("game", "").strip()
        website = request.form.get("website", "").strip()

        safe_name = escape(name)
        safe_email = escape(email)
        safe_message = escape(message)
        safe_reason = escape(reason)
        safe_game = escape(game)

        if website:
            # Almost certainly a bot
            return redirect(url_for("contact"))

        if len(name) > 100:
            flash("Name is too long.", "danger")
            return redirect(url_for("contact"))

        if len(email) > 254:
            flash("Email address is too long.", "danger")
            return redirect(url_for("contact"))

        if len(message) > 5000:
            flash("Message is too long.", "danger")
            return redirect(url_for("contact"))

        # For now, just check that we received the data
        try:
            params = {
                "from": "onboarding@resend.dev",
                "to": "officialteachersonline@gmail.com",
                "subject": f"Contact Form: {safe_name}",

                "html": f"""
                    <h2>New Contact Form Message</h2>

                    <p>
                        <strong>Name:</strong> {safe_name}
                    </p>

                    <p>
                        <strong>Email:</strong> {safe_email}
                    </p>

                    <p>
                        <strong>Reason:</strong> {safe_reason}
                    </p>

                    <p>
                        <strong>Game:</strong> {safe_game}
                    </p>

                    <hr>

                    <h3>Message</h3>

                    <p>
                        {safe_message}
                    </p>
                """
            }

            resend.Emails.send(params)

            flash(
                "Thank you! Your message has been sent.",
                "success"
            )

        except Exception as e:

            print("CONTACT FORM ERROR:", e)

            flash(
                "Sorry, something went wrong. Please try again later.",
                "danger"
            )

        return redirect(url_for("contact"))
    return render_template("contact.html")


@app.route("/games/exploding-kittens")
def exploding_kittens():
    return render_template("exploding_kittens.html")

@app.route("/games/battleship")
def battleship():
    return render_template("battleship.html")

@app.route("/games/classroom-pirates")
def classroom_pirates():
    return render_template("classroom_pirates.html")

@app.route("/games/pokemon-hunters")
def pokemon_hunters():
    return render_template("pokemon_hunters.html")

@app.route("/games/review_questions/<game_name>")
def review_questions(game_name):
    if not session.get("user"):
        flash("Please log in or sign up to create a lesson pack.", "warning")
        return redirect(url_for("login"))

    return render_template(
        "review_questions.html",
        game_name=game_name
    )

@app.route("/games/speaking_questions/<game_name>")
def speaking_questions(game_name):
    if not session.get("user"):
        flash("Please log in or sign up to create a lesson pack.", "warning")
        return redirect(url_for("login"))

    return render_template(
        "speaking_questions.html",
        game_name=game_name
    )

@app.route("/worksheets")
def worksheet_generator():
    if not session.get("user"):
        flash("Please log in or sign up to use the Worksheet Generator.", "warning")
        return redirect(url_for("login"))

    return render_template("worksheet.html")

@app.route("/api/translate", methods=["POST"])
def api_translate():
    payload = request.get_json(silent=True) or {}

    text = (payload.get("text") or "").strip()
    source = payload.get("source", "en")
    target = payload.get("target", "ko")

    if not text:
        return jsonify({"translation": ""})

    try:
        translated = GoogleTranslator(
            source=source,
            target=target
        ).translate(text)

        return jsonify({
            "translation": translated or ""
        })
    except Exception:
        return jsonify({
            "translation": ""
        })


@app.route("/export", methods=["POST"])
def export():

    data = request.get_json()

    title = str(data.get("title") or "").strip() or "Untitled Worksheet"
    headers = data["headers"]
    sections_data = data["sections"]

    sections = []

    # ====================================
    # Create section objects
    # ====================================

    for section in sections_data:

        if section["type"] == "unscramble":

            new_section = UnscrambleSection(
                title=section["title"],
                words=section["words"],
                show_word_bank=section["show_word_bank"],
                formatting=section["formatting"]
            )

            sections.append(new_section)

        elif section["type"] == "fill_blank":

            new_section = FillBlankSection(
                title=section["title"],
                questions=section["questions"],
                formatting=section["formatting"]
            )

            sections.append(new_section)

        elif section["type"] == "translation":

            new_section = TranslationSection(
                title=section.get("title", "Translate"),
                pairs=section.get("pairs", []),
                direction=section.get("direction", "English → Korean"),
                formatting=section.get("formatting", {})
            )

            sections.append(new_section)

        elif section["type"] == "word_search":

            new_section = WordSearchSection(
                title=section["title"],
                difficulty=section["difficulty"],
                grid_size=section["grid_size"],
                instructions=section["instructions"],
                words=section["words"],
                formatting=section["formatting"]
            )

            sections.append(new_section)

    # ====================================
    # CREATE WORKSHEET DOCUMENT
    # ====================================

    doc = Document()

    doc.add_heading(title, level=0)

    if headers:

        header_table = doc.add_table(
            rows=1,
            cols=len(headers) * 2
        )

        col = 0

        for header in headers:

            header_table.rows[0].cells[col].text = (
                f"{header}:"
            )

            header_table.rows[0].cells[col + 1].text = (
                "______________"
            )

            col += 2

    # ====================================
    # CREATE ANSWER DOCUMENT
    # ====================================

    answer_doc = Document()

    answer_doc.add_heading(
        f"{title} - Answer Key",
        level=0
    )

    # ====================================
    # EXPORT SECTIONS
    # ====================================

    for section in sections:

        # Worksheet

        add_formatted_title(
            doc,
            section.get_title(),
            section.formatting
        )

        section.export(doc)

        doc.add_paragraph()

        # Answer Key

        add_formatted_title(
            answer_doc,
            section.get_title(),
            section.formatting
        )

        section.export_answers(answer_doc)

        answer_doc.add_paragraph()

    # ====================================
    # SAVE DOCX FILES TO MEMORY
    # ====================================

    worksheet_stream = BytesIO()
    answer_stream = BytesIO()

    doc.save(worksheet_stream)
    answer_doc.save(answer_stream)

    worksheet_stream.seek(0)
    answer_stream.seek(0)

    # ====================================
    # CREATE ZIP FILE
    # ====================================

    zip_stream = BytesIO()

    with zipfile.ZipFile(
        zip_stream,
        "w",
        zipfile.ZIP_DEFLATED
    ) as zip_file:

        zip_file.writestr(
            f"{title}.docx",
            worksheet_stream.getvalue()
        )

        zip_file.writestr(
            f"{title} Answer Key.docx",
            answer_stream.getvalue()
        )

    zip_stream.seek(0)

    # ====================================
    # SEND ZIP TO USER
    # ====================================

    return send_file(
        zip_stream,
        as_attachment=True,
        download_name=f"{title}.zip",
        mimetype="application/zip"
    )

def add_formatted_title(
        doc,
        text,
        formatting):

    p = doc.add_paragraph()

    run = p.add_run(text)

    run.bold = formatting.get(
        "bold",
        False
    )

    run.italic = formatting.get(
        "italic",
        False
    )

    run.underline = formatting.get(
        "underline",
        False
    )

    run.font.size = Pt(
        formatting.get(
            "font_size",
            16
        )
    )

if __name__ == "__main__":
    app.run(debug=True)